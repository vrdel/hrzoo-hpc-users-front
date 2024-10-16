import calendar
import datetime
import math

import pandas as pd
from backend import models
from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache


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
                "accounting_record__gpuh"
            )
        )

        df = df.rename(columns={
            "project__identifier": "project",
            "project__date_end": "project_end",
            "project__date_start": "project_start",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh"
        })

        df = df.sort_values(by=["end_time"])

        resources = df["resource"].unique()

        for resource in resources:
            cpuh = list()
            gpuh = list()
            df_resource = df[df["resource"] == resource]

            for date in dates:
                month_start = date
                year = date.year
                month = date.month
                month_end = datetime.date(
                    year, month, calendar.monthrange(year, month)[1]
                )
                df_month = df_resource[
                    (df_resource["end_time"].dt.date <= month_end) *
                    (df_resource["project_end"] >= month_start) *
                    (df_resource["project_start"] <= month_end)
                    ]

                active_projects_in_month = df_resource[
                    (df_resource["project_end"] >= month_start) *
                    (df_resource["project_start"] <= month_end)
                    ]

                projects = active_projects_in_month["project"].unique()

                cpu_dict = dict()
                gpu_dict = dict()
                for project in projects:
                    df_project = df_month[df_month["project"] == project]
                    proj_cpuh = float(df_project["cpuh"].sum(axis=0))
                    proj_gpuh = float(df_project["gpuh"].sum(axis=0))
                    if "month" not in cpu_dict:
                        cpu_dict.update({"month": f"{month:02d}/{year}"})

                    if proj_cpuh > 0:
                        cpu_dict.update({project: math.floor(proj_cpuh)})

                    if "month" not in gpu_dict:
                        gpu_dict.update({"month": f"{month:02d}/{year}"})

                    if proj_gpuh:
                        gpu_dict.update({project: math.floor(proj_gpuh)})

                if cpu_dict:
                    cpuh.append(cpu_dict)

                if gpu_dict:
                    gpuh.append(gpu_dict)

            output.update({resource: {
                "cpuh": cpuh,
                "gpuh": gpuh
            }})

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
