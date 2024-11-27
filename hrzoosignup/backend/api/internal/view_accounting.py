import calendar
import datetime
import math

import pandas as pd
from backend import models
from dateutil.relativedelta import relativedelta
from django.core.cache import cache
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def date_today():
    return datetime.date.today()


def usage4user(username):
    todays_date = date_today()
    current_month_start = datetime.date(
        todays_date.year, todays_date.month, 1
    )
    six_months_ago = current_month_start - relativedelta(months=6)
    dates = [
        six_months_ago + relativedelta(months=i) for i in range(7)
    ]

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

        df = df.sort_values(by=["end_time"])

        resources = df["resource"].unique()

        for resource in resources:
            cpuh_cummulative = list()
            gpuh_cummulative = list()
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

                cpu_cummulative = dict()
                gpu_cummulative = dict()
                cpu_monthly = dict()
                gpu_monthly = dict()
                if "month" not in cpu_cummulative:
                    cpu_cummulative.update({"month": f"{month:02d}/{year}"})

                if "month" not in gpu_cummulative:
                    gpu_cummulative.update(
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

                    if math.floor(proj_cpuh) > 0:
                        cpu_cummulative.update({project: math.floor(proj_cpuh)})

                    if math.floor(proj_gpuh) > 0:
                        gpu_cummulative.update({project: math.floor(proj_gpuh)})

                    if math.floor(monthly_cpuh) > 0:
                        cpu_monthly.update({project: math.floor(monthly_cpuh)})

                    if math.floor(monthly_gpuh) > 0:
                        gpu_monthly.update({project: math.floor(monthly_gpuh)})

                if cpu_cummulative:
                    cpuh_cummulative.append(cpu_cummulative)

                if gpu_cummulative:
                    gpuh_cummulative.append(gpu_cummulative)

                if cpu_monthly:
                    cpuh_monthly.append(cpu_monthly)

                if gpu_monthly:
                    gpuh_monthly.append(gpu_monthly)

            if resource == "padobran":
                output.update({
                    resource: {
                        "cumulative": {
                            "cpuh": cpuh_cummulative
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
                            "cpuh": cpuh_cummulative,
                            "gpuh": gpuh_cummulative
                        },
                        "monthly": {
                            "cpuh": cpuh_monthly,
                            "gpuh": gpuh_monthly
                        }
                    }
                })

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
