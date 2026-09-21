import calendar
import datetime
import math

import numpy as np
import pandas as pd
from backend import models
from backend.utils.accounting import get_users_in_project
from dateutil.relativedelta import relativedelta
from backend.caching import entries, store
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def date_today():
    return timezone.make_aware(
        datetime.datetime.combine(
            datetime.date.today(),
            datetime.datetime.min.time()
        ),
        timezone=timezone.get_current_timezone()
    )


def diff_months(date1, date2):
    if date2.year == date1.year:
        return abs(date1.month - date2.month) + 1

    else:
        if date2.year > date1.year:
            month1 = date1.month
            month2 = date2.month

        else:
            month1 = date2.month
            month2 = date1.month

        return (abs(date1.year - date2.year) - 1) * 12 + 13 - month1 + month2


def _is_user_lead(user):
    return len(models.UserProject.objects.filter(
        user=user,
        role=models.Role.objects.get(name="lead")
    )) > 0


def _is_usage_empty(usage):
    usage_keys = set()
    for item in usage:
        usage_keys.update(list(item.keys()))

    if len(usage_keys) == 1 and usage_keys == {"month"}:
        return True

    else:
        return False


def _get_dates(df):
    todays_date = date_today()
    beginning_of_times = min(df["end_time"]).to_pydatetime().date()

    return [
        datetime.date(
            beginning_of_times.year, beginning_of_times.month, 1
        ) + relativedelta(months=i) for i in range(
            diff_months(beginning_of_times, todays_date)
        )
    ]


def _generate_usage(df, dates, iterable=None, per_user=False):
    """Partition once, then sum only each chart series instead of filtering
    whole dataframes for every resource/month/user combination.
    """
    output = {}
    if df.empty:
        return output
    df = df.copy()
    df["project_end"] = df["bogus_end"].where(
        df["bogus_end"].notna(), df["project_end"]
    )
    df["end_date"] = df["end_time"].dt.date
    months = [(date, datetime.date(date.year, date.month,
                                  calendar.monthrange(date.year, date.month)[1]))
              for date in dates]
    for resource, resource_df in df.groupby("resource", sort=False):
        if per_user and resource == "cloud":
            continue
        series = {kind: [{"month": f"{start.month:02d}/{start.year}"}
                         for start, _ in months]
                  for kind in ("cpu_cumulative", "gpu_cumulative", "cpu_monthly", "gpu_monthly")}
        group_key = "user" if per_user else "project"
        groups = dict(tuple(resource_df.groupby(group_key, sort=False)))
        items = [(user.person_username, f"{user.first_name} {user.last_name}")
                 for user in iterable] if per_user else [(key, key) for key in groups]
        cpu_key, gpu_key = (("jupyter_cpuh", "jupyter_gpuh")
                            if resource == "jupyter" and not per_user else ("cpuh", "gpuh"))
        for key, label in items:
            group = groups.get(key)
            if group is None:
                continue
            # Keep pandas sum semantics (nulls, fractions, and >1 threshold).
            cpu, gpu = group[cpu_key].to_numpy(), group[gpu_key].to_numpy()
            ended = pd.to_datetime(group["end_date"]).to_numpy(dtype="datetime64[D]")
            starts = pd.to_datetime(group["project_start"]).to_numpy(dtype="datetime64[D]")
            ends = pd.to_datetime(group["project_end"]).to_numpy(dtype="datetime64[D]")
            for index, (start, end) in enumerate(months):
                start, end = np.datetime64(start), np.datetime64(end)
                cumulative = (ended <= end) & (ends >= start) & (starts <= end)
                monthly = cumulative & (ended >= start)
                for name, values, mask in (
                    ("cpu_cumulative", cpu, cumulative),
                    ("gpu_cumulative", gpu, cumulative),
                    ("cpu_monthly", cpu, monthly),
                    ("gpu_monthly", gpu, monthly),
                ):
                    selected = values[mask]
                    total = float(np.nansum(selected) if values.dtype.kind in "biuf"
                                  else pd.Series(selected).sum())
                    if total > 1:
                        series[name][index][label] = math.floor(total)
        for metric, prefix in (("cpuh", "cpu"), ("gpuh", "gpu")):
            if resource == "padobran" and metric == "gpuh":
                continue
            monthly = series[f"{prefix}_monthly"]
            if not _is_usage_empty(monthly):
                chart = output.setdefault(resource, {"cumulative": {}, "monthly": {}})
                chart["cumulative"][metric] = series[f"{prefix}_cumulative"]
                chart["monthly"][metric] = monthly
    return output


def _project_info(records):
    output = dict()
    if len(records) > 0:
        df = pd.DataFrame.from_records(
            records.values(
                "project__identifier",
                "project__date_end",
                "project__bogus_end",
                "project__date_start",
                "resource_name",
                "end_time",
                "accounting_record__cpuh",
                "accounting_record__gpuh",
                "accounting_record__jupyter_cpu_h",
                "accounting_record__jupyter_gpu_h"
            )
        )

        df = df.rename(columns={
            "project__identifier": "project",
            "project__date_end": "project_end",
            "project__bogus_end": "bogus_end",
            "project__date_start": "project_start",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh",
            "accounting_record__jupyter_cpu_h": "jupyter_cpuh",
            "accounting_record__jupyter_gpu_h": "jupyter_gpuh"
        })

        output = _generate_usage(df=df, dates=_get_dates(df))

    return output


def usage4user(username):
    projects = [
        item.project for item in models.UserProject.objects.filter(
            user=models.User.objects.get(username=username)
        )
    ]

    records = models.ResourceUsage.objects.filter(
        user=models.User.objects.get(username=username)
    )
    output = _project_info(records)

    projects_mapping = dict()
    for project in projects:
        projects_mapping.update({project.identifier: project.name})

    if projects_mapping and output:
        output.update({"projects_mapping": projects_mapping})

    return output


def _leader_records(lead_username):
    projects = [
        item.project for item in models.UserProject.objects.filter(
            user=models.User.objects.get(username=lead_username),
            role=models.Role.objects.get(name="lead")
        )
    ]

    records = models.ResourceUsage.objects.filter(
        Q(project__in=projects) & ~Q(resource_name="jupyter")
    )

    return projects, records


def usage4project_per_user(lead_username):
    projects, records = _leader_records(lead_username)

    output = dict()
    if len(records) > 0:
        df = pd.DataFrame.from_records(
            records.values(
                "project__identifier",
                "project__date_end",
                "project__bogus_end",
                "project__date_start",
                "user__person_username",
                "resource_name",
                "end_time",
                "accounting_record__cpuh",
                "accounting_record__gpuh",
                "accounting_record__jupyter_cpu_h",
                "accounting_record__jupyter_gpu_h"
            )
        )

        df = df.rename(columns={
            "project__identifier": "project",
            "project__date_end": "project_end",
            "project__bogus_end": "bogus_end",
            "project__date_start": "project_start",
            "user__person_username": "user",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh",
            "accounting_record__jupyter_cpu_h": "jupyter_cpuh",
            "accounting_record__jupyter_gpu_h": "jupyter_gpuh"
        })

        dates = _get_dates(df)
        projects_mapping = dict()
        for project in projects:
            projects_mapping.update({project.identifier: project.name})
            users = get_users_in_project(project_identifier=project.identifier)

            df_project = df[df["project"] == project.identifier]

            project_usage = _generate_usage(
                df=df_project,
                dates=dates,
                iterable=users,
                per_user=True
            )

            if project_usage:
                output.update({project.identifier: project_usage})

        if projects_mapping and output:
            output.update({"projects_mapping": projects_mapping})

    return output


def usage4project(lead_username):
    projects, records = _leader_records(lead_username)

    output = _project_info(records)

    projects_mapping = dict()
    for project in projects:
        projects_mapping.update({project.identifier: project.name})

    if projects_mapping and output:
        output.update({"projects_mapping": projects_mapping})

    return output


class ResourceUsage(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user

        data = store.remember(entries.USER_USAGE,
                              lambda: usage4user(user.username), account=user.username)
        return Response(data=data, status=status.HTTP_200_OK)


class ProjectUsage(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user

        if not _is_user_lead(user):
            err_status = status.HTTP_401_UNAUTHORIZED
            err_response = {
                "status": {
                    "code": err_status,
                    "message": "Only project leaders are allowed this view"
                }
            }

            return Response(err_response, status=err_status)

        else:
            return Response(
                data=store.remember(entries.PROJECT_USAGE,
                                    lambda: usage4project(user.username), account=user.username),
                status=status.HTTP_200_OK
            )


class ProjectUsagePerUser(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user

        if not _is_user_lead(user):
            err_status = status.HTTP_401_UNAUTHORIZED
            err_response = {
                "status": {
                    "code": err_status,
                    "message": "Only project leaders are allowed this view"
                }
            }

            return Response(err_response, status=err_status)

        else:
            data = store.remember(entries.PROJECT_USER_USAGE,
                                  lambda: usage4project_per_user(user.username), account=user.username)
            return Response(data=data, status=status.HTTP_200_OK)
