import calendar
import datetime
import math

import pandas as pd
from backend import models
from backend.utils.accounting import get_users_in_project
from dateutil.relativedelta import relativedelta
from django.core.cache import cache
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
    def _update_dict(resource_dict, df_in, value, key):
        puh = float(df_in[value].sum(axis=0))

        if puh > 1:
            return resource_dict.update({key: math.floor(puh)})

    def _choose_end_date(rsrc):
        if "bogus_end" in rsrc and rsrc["bogus_end"]:
            return rsrc["bogus_end"]

        else:
            return rsrc["project_end"]

    output = dict()
    df_copy = df.copy()
    del df
    df_copy["project_end"] = df_copy.apply(
        lambda row: _choose_end_date(row), axis=1
    )
    resources = df_copy["resource"].unique()
    for resource in resources:
        cpuh_cumulative = list()
        gpuh_cumulative = list()
        cpuh_monthly = list()
        gpuh_monthly = list()
        df_resource = df_copy[df_copy["resource"] == resource]

        for date in dates:
            month_start = date
            year = date.year
            month = date.month
            month_end = datetime.date(
                year, month, calendar.monthrange(year, month)[1]
            )
            df_cumulative = df_resource[
                (df_resource["end_time"].dt.date <= month_end) *
                (df_resource["project_end"] >= month_start) *
                (df_resource["project_start"] <= month_end)
            ]

            df_monthly = df_resource[
                (df_resource["end_time"].dt.date <= month_end) *
                (df_resource["project_end"] >= month_start) *
                (df_resource["project_start"] <= month_end) *
                (df_resource["end_time"].dt.date >= month_start)
            ]

            if not per_user:
                active_projects_in_month = df_resource[
                    (df_resource["project_end"] >= month_start) *
                    (df_resource["project_start"] <= month_end)
                ]

                iterable = active_projects_in_month["project"].unique()

            cpu_cumulative = dict()
            gpu_cumulative = dict()
            cpu_monthly = dict()
            gpu_monthly = dict()
            if "month" not in cpu_cumulative:
                cpu_cumulative.update({"month": f"{month:02d}/{year}"})

            if "month" not in gpu_cumulative:
                gpu_cumulative.update(
                    {"month": f"{month:02d}/{year}"}
                )

            if "month" not in cpu_monthly:
                cpu_monthly.update({"month": f"{month:02d}/{year}"})

            if "month" not in gpu_monthly:
                gpu_monthly.update({"month": f"{month:02d}/{year}"})

            for item in iterable:
                cpuh_key = "cpuh"
                gpuh_key = "gpuh"
                if per_user:
                    item_key = f"{item.first_name} {item.last_name}"
                    df_cumulative_per_item = df_cumulative[
                        df_cumulative["user"] == item.person_username
                    ]
                    df_monthly_per_item = df_monthly[
                        df_monthly["user"] == item.person_username
                    ]

                else:
                    item_key = item
                    df_cumulative_per_item = df_cumulative[
                        df_cumulative["project"] == item
                    ]
                    df_monthly_per_item = df_monthly[
                        df_monthly["project"] == item
                    ]

                    if resource == "jupyter":
                        cpuh_key = "jupyter_cpuh"
                        gpuh_key = "jupyter_gpuh"

                if not (resource == "cloud" and per_user):
                    _update_dict(
                        resource_dict=cpu_cumulative,
                        df_in=df_cumulative_per_item,
                        value=cpuh_key,
                        key=item_key
                    )
                    _update_dict(
                        resource_dict=gpu_cumulative,
                        df_in=df_cumulative_per_item,
                        value=gpuh_key,
                        key=item_key
                    )
                    _update_dict(
                        resource_dict=cpu_monthly,
                        df_in=df_monthly_per_item,
                        value=cpuh_key,
                        key=item_key
                    )
                    _update_dict(
                        resource_dict=gpu_monthly,
                        df_in=df_monthly_per_item,
                        value=gpuh_key,
                        key=item_key
                    )

            if cpu_cumulative:
                cpuh_cumulative.append(cpu_cumulative)

            if gpu_cumulative:
                gpuh_cumulative.append(gpu_cumulative)

            if cpu_monthly:
                cpuh_monthly.append(cpu_monthly)

            if gpu_monthly:
                gpuh_monthly.append(gpu_monthly)

        if resource == "padobran":
            if not _is_usage_empty(cpuh_monthly):
                output.update({
                    resource: {
                        "cumulative": {
                            "cpuh": cpuh_cumulative
                        },
                        "monthly": {
                            "cpuh": cpuh_monthly
                        }
                    }
                })

        else:
            if not _is_usage_empty(cpuh_monthly):
                output.update({
                    resource: {
                        "cumulative": {
                            "cpuh": cpuh_cumulative
                        },
                        "monthly": {
                            "cpuh": cpuh_monthly
                        }
                    }
                })

            if not _is_usage_empty(gpuh_monthly):
                if resource in output:
                    output[resource]["cumulative"].update({
                        "gpuh": gpuh_cumulative
                    })
                    output[resource]["monthly"].update({
                        "gpuh": gpuh_monthly
                    })

                else:
                    output.update({
                        resource: {
                            "cumulative": {
                                "gpuh": gpuh_cumulative
                            },
                            "monthly": {
                                "gpuh": gpuh_monthly
                            }
                        }
                    })

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

        cached_data = cache.get(f"usage_{user.username}")

        if cached_data:
            return Response(data=cached_data, status=status.HTTP_200_OK)

        else:
            output = usage4user(user.username)

            return Response(data=output, status=status.HTTP_200_OK)


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
                data=usage4project(user.username),
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
            cached_data = cache.get(
                f"project_user_usage_{user.username}"
            )

            if cached_data:
                return Response(data=cached_data, status=status.HTTP_200_OK)

            else:
                return Response(
                    usage4project_per_user(user.username),
                    status=status.HTTP_200_OK
                )
