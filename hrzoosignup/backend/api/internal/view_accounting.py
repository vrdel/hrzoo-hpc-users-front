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


def usage4user(username):
    todays_date = date_today()

    records = models.ResourceUsage.objects.filter(
        user=models.User.objects.get(person_username=username)
    )

    output = dict()

    if len(records) > 0:
        df = pd.DataFrame.from_records(
            records.values(
                "project__identifier",
                "project__date_end",
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
            "project__date_start": "project_start",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh",
            "accounting_record__jupyter_cpu_h": "jupyter_cpuh",
            "accounting_record__jupyter_gpu_h": "jupyter_gpuh"
        })

        beginning_of_times = min(df["end_time"]).to_pydatetime().date()

        dates = [
            datetime.date(
                beginning_of_times.year, beginning_of_times.month, 1
            ) + relativedelta(months=i) for i in range(
                diff_months(beginning_of_times, todays_date)
            )
        ]

        resources = df["resource"].unique()

        for resource in resources:
            cpuh_cumulative = list()
            gpuh_cumulative = list()
            cpuh_monthly = list()
            gpuh_monthly = list()
            df_resource = df[df["resource"] == resource]

            for date in dates:
                month_start = date
                year = date.year
                month = date.month
                month_end = datetime.date(
                    year, month, calendar.monthrange(year, month)[1]
                )
                df_cumulative_month = df_resource[
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

                active_projects_in_month = df_resource[
                    (df_resource["project_end"] >= month_start) *
                    (df_resource["project_start"] <= month_end)
                ]

                projects = active_projects_in_month["project"].unique()

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

                for project in projects:
                    df_project = df_cumulative_month[
                        df_cumulative_month["project"] == project
                    ]
                    df_project_monthly = df_monthly[
                        df_monthly["project"] == project
                    ]
                    if resource == "jupyter":
                        proj_cpuh = float(
                            df_project["jupyter_cpuh"].sum(axis=0)
                        )
                        proj_gpuh = float(
                            df_project["jupyter_gpuh"].sum(axis=0)
                        )
                        monthly_cpuh = float(
                            df_project_monthly["jupyter_cpuh"].sum(axis=0)
                        )
                        monthly_gpuh = float(
                            df_project_monthly["jupyter_gpuh"].sum(axis=0)
                        )

                    else:
                        proj_cpuh = float(df_project["cpuh"].sum(axis=0))
                        proj_gpuh = float(df_project["gpuh"].sum(axis=0))
                        monthly_cpuh = float(
                            df_project_monthly["cpuh"].sum(axis=0)
                        )
                        monthly_gpuh = float(
                            df_project_monthly["gpuh"].sum(axis=0)
                        )

                    if proj_cpuh > 1:
                        cpu_cumulative.update({project: math.floor(proj_cpuh)})

                    if proj_gpuh > 1:
                        gpu_cumulative.update({project: math.floor(proj_gpuh)})

                    if monthly_cpuh > 1:
                        cpu_monthly.update({project: math.floor(monthly_cpuh)})

                    if monthly_gpuh > 1:
                        gpu_monthly.update({project: math.floor(monthly_gpuh)})

                if cpu_cumulative:
                    cpuh_cumulative.append(cpu_cumulative)

                if gpu_cumulative:
                    gpuh_cumulative.append(gpu_cumulative)

                if cpu_monthly:
                    cpuh_monthly.append(cpu_monthly)

                if gpu_monthly:
                    gpuh_monthly.append(gpu_monthly)

            if resource == "padobran":
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
                output.update({
                    resource: {
                        "cumulative": {
                            "cpuh": cpuh_cumulative,
                            "gpuh": gpuh_cumulative
                        },
                        "monthly": {
                            "cpuh": cpuh_monthly,
                            "gpuh": gpuh_monthly
                        }
                    }
                })

    return output


def usage4project(lead_username):
    todays_date = date_today()

    projects = [
        item.project for item in models.UserProject.objects.filter(
            user=models.User.objects.get(person_username=lead_username),
            role=models.Role.objects.get(name="lead")
        )
    ]

    records = models.ResourceUsage.objects.filter(
        Q(project__in=projects) & ~Q(resource_name="jupyter")
    )

    output = dict()
    if len(records) > 0:
        df = pd.DataFrame.from_records(
            records.values(
                "project__identifier",
                "project__date_end",
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
            "project__date_start": "project_start",
            "user__person_username": "user",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh",
            "accounting_record__jupyter_cpu_h": "jupyter_cpuh",
            "accounting_record__jupyter_gpu_h": "jupyter_gpuh"
        })

        beginning_of_times = min(df["end_time"]).to_pydatetime().date()

        dates = [
            datetime.date(
                beginning_of_times.year, beginning_of_times.month, 1
            ) + relativedelta(months=i) for i in range(
                diff_months(beginning_of_times, todays_date)
            )
        ]

        for project in projects:
            project_usage = dict()
            users = get_users_in_project(project_identifier=project.identifier)

            df_project = df[df["project"] == project.identifier]

            resources = df_project["resource"].unique()

            for resource in resources:
                cpuh_cumulative = list()
                gpuh_cumulative = list()
                cpuh_monthly = list()
                gpuh_monthly = list()
                df_resource = df_project[df_project["resource"] == resource]

                for date in dates:
                    month_start = date
                    year = date.year
                    month = date.month
                    month_end = datetime.date(
                        year, month, calendar.monthrange(year, month)[1]
                    )

                    df_cumulative_month = df_resource[
                        df_resource["end_time"].dt.date <= month_end
                    ]

                    df_monthly = df_resource[
                        (df_resource["end_time"].dt.date <= month_end) *
                        (df_resource["end_time"].dt.date >= month_start)
                    ]

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

                    if resource == "cloud":
                        cloud_cpuh = float(
                            df_cumulative_month["cpuh"].sum(axis=0)
                        )
                        cloud_gpuh = float(
                            df_cumulative_month["gpuh"].sum(axis=0)
                        )
                        cloud_monthly_cpuh = float(
                            df_monthly["cpuh"].sum(axis=0)
                        )
                        cloud_monthly_gpuh = float(
                            df_monthly["gpuh"].sum(axis=0)
                        )

                        if cloud_cpuh > 1:
                            cpu_cumulative.update({
                                "total_project_usage": math.floor(cloud_cpuh)
                            })

                        if cloud_gpuh > 1:
                            gpu_cumulative.update({
                                "total_project_usage": math.floor(cloud_gpuh)
                            })

                        if cloud_monthly_cpuh > 1:
                            cpu_monthly.update({
                                "total_project_usage": math.floor(
                                    cloud_monthly_cpuh
                                )
                            })

                        if cloud_monthly_gpuh > 1:
                            gpu_monthly.update({
                                "total_project_usage": math.floor(
                                    cloud_monthly_gpuh
                                )
                            })

                    else:
                        for user in users:
                            user_key = f"{user.first_name} {user.last_name}"
                            df_user = df_cumulative_month[
                                df_cumulative_month["user"] ==
                                user.person_username
                            ]
                            df_user_monthly = df_monthly[
                                df_monthly["user"] == user.person_username
                            ]

                            user_cpuh = float(df_user["cpuh"].sum(axis=0))
                            user_gpuh = float(df_user["gpuh"].sum(axis=0))
                            monthly_cpuh = float(
                                df_user_monthly["cpuh"].sum(axis=0)
                            )
                            monthly_gpuh = float(
                                df_user_monthly["gpuh"].sum(axis=0)
                            )

                            if user_cpuh > 1:
                                cpu_cumulative.update({
                                    user_key: math.floor(user_cpuh)
                                })

                            if user_gpuh > 1:
                                gpu_cumulative.update({
                                    user_key: math.floor(user_gpuh)
                                })

                            if monthly_cpuh > 1:
                                cpu_monthly.update({
                                    user_key: math.floor(monthly_cpuh)
                                })

                            if monthly_gpuh > 1:
                                gpu_monthly.update({
                                    user_key: math.floor(monthly_gpuh)
                                })

                    if cpu_cumulative:
                        cpuh_cumulative.append(cpu_cumulative)

                    if gpu_cumulative:
                        gpuh_cumulative.append(gpu_cumulative)

                    if cpu_monthly:
                        cpuh_monthly.append(cpu_monthly)

                    if gpu_monthly:
                        gpuh_monthly.append(gpu_monthly)

                    if resource == "padobran":
                        project_usage.update({
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
                        project_usage.update({
                            resource: {
                                "cumulative": {
                                    "cpuh": cpuh_cumulative,
                                    "gpuh": gpuh_cumulative
                                },
                                "monthly": {
                                    "cpuh": cpuh_monthly,
                                    "gpuh": gpuh_monthly
                                }
                            }
                        })

            if project_usage:
                output.update({project.identifier: project_usage})

    return output


class ResourceUsage(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user

        cached_data = cache.get(f"usage_{user.person_username}")

        if cached_data:
            return Response(data=cached_data, status=status.HTTP_200_OK)

        else:
            output = usage4user(user.person_username)

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
                usage4project(user.person_username), status=status.HTTP_200_OK
            )
