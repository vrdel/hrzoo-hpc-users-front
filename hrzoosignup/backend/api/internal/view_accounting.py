import calendar
import datetime
import math

import numpy as np
import pandas as pd
from backend import models
from dateutil.relativedelta import relativedelta
from backend.caching import entries, store
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
    return models.UserProject.objects.filter(user=user, role__name="lead").exists()


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


_USAGE_COLUMNS = {
    "project__identifier": "project",
    "project__date_end": "project_end",
    "project__bogus_end": "bogus_end",
    "project__date_start": "project_start",
    "user__person_username": "user",
    "resource_name": "resource",
    "end_time": "end_time",
    "accounting_record__cpuh": "cpuh",
    "accounting_record__gpuh": "gpuh",
    "accounting_record__jupyter_cpu_h": "jupyter_cpuh",
    "accounting_record__jupyter_gpu_h": "jupyter_gpuh",
}


def _usage_frame(records):
    # Fetch projected values once, without first loading complete model objects.
    return pd.DataFrame.from_records(
        records.values(*_USAGE_COLUMNS).iterator(chunk_size=2000),
        columns=list(_USAGE_COLUMNS),
    ).rename(columns=_USAGE_COLUMNS)


def _project_info(records):
    df = _usage_frame(records)
    return _generate_usage(df, _get_dates(df)) if not df.empty else {}


def usage4user(username):
    records = models.ResourceUsage.objects.filter(user__username=username)
    output = _project_info(records)
    if output:
        projects_mapping = dict(models.UserProject.objects.filter(
            user__username=username
        ).values_list("project__identifier", "project__name"))
        if projects_mapping:
            output["projects_mapping"] = projects_mapping
    return output


def _leader_records(lead_username, include_users=False):
    memberships = models.UserProject.objects.filter(
        user__username=lead_username, role__name="lead"
    ).select_related("project")
    if include_users:
        memberships = memberships.prefetch_related("project__users")
    projects = [item.project for item in memberships]
    records = models.ResourceUsage.objects.filter(
        project__in=projects
    ).exclude(resource_name="jupyter")
    return projects, records


def _per_user_project_info(projects, df):
    output = {}
    if df.empty:
        return output
    dates = _get_dates(df)
    for project in projects:
        users = [user for user in project.users.all()
                 if user.person_institution not in ("", "Nepoznato")]
        project_usage = _generate_usage(
            df=df[df["project"] == project.identifier], dates=dates,
            iterable=users, per_user=True,
        )
        if project_usage:
            output[project.identifier] = project_usage
    return _with_project_names(output, projects)


def _with_project_names(output, projects):
    if output and projects:
        output["projects_mapping"] = {project.identifier: project.name for project in projects}
    return output


def usage4project_per_user(lead_username):
    projects, records = _leader_records(lead_username, include_users=True)
    return _per_user_project_info(projects, _usage_frame(records))


def usage4project(lead_username):
    projects, records = _leader_records(lead_username)
    return _with_project_names(_project_info(records), projects)


def usage4leader(lead_username):
    """Build both leader responses from one database read and dataframe."""
    projects, records = _leader_records(lead_username, include_users=True)
    df = _usage_frame(records)
    per_user = _per_user_project_info(projects, df)
    totals = _generate_usage(df, _get_dates(df)) if not df.empty else {}
    return per_user, _with_project_names(totals, projects)


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
