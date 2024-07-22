import datetime
import calendar

import pandas as pd
from backend import models
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ResourceUsage(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        records = models.ResourceUsage.objects.filter(
            user=models.User.objects.get(person_username=user)
        )

        df = pd.DataFrame.from_records(
            records.values(
                "project__identifier",
                "project__date_end",
                "resource_name",
                "end_time",
                "accounting_record__cpuh",
                "accounting_record__gpuh"
            )
        )

        df = df.rename(columns={
            "project__identifier": "project",
            "project__date_end": "project_end",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh"
        })

        df["month"] = df.apply(
            lambda rec: (rec["end_time"].year, rec["end_time"].month), axis=1
        )

        df = df.sort_values(by=["end_time"])

        resources = df["resource"].unique()

        output = dict()
        for resource in resources:
            cpuh = list()
            gpuh = list()
            df_resource = df[df["resource"] == resource]

            dates = df_resource["month"].unique()
            for date in dates:
                year, month = date
                month_date = datetime.date(
                    year, month, calendar.monthrange(year, month)[1]
                )
                df_month = df_resource[
                    (df_resource["end_time"].dt.date <= month_date) *
                    (df_resource["project_end"] >= month_date)
                ]

                projects = df_month["project"].unique()

                cpu_dict = dict()
                gpu_dict = dict()
                for project in projects:
                    df_project = df_month[df_month["project"] == project]
                    proj_cpuh = float(df_project["cpuh"].sum(axis=0))
                    proj_gpuh = float(df_project["gpuh"].sum(axis=0))
                    cpu_dict.update({"month": f"{month:02d}/{year}"})
                    cpu_dict.update({project: proj_cpuh})

                    gpu_dict.update({"month": f"{month:02d}/{year}"})
                    gpu_dict.update({project: proj_gpuh})

                if cpu_dict:
                    cpuh.append(cpu_dict)

                if gpu_dict:
                    gpuh.append(gpu_dict)

            output.update({resource: {
                "cpuh": cpuh,
                "gpuh": gpuh
            }})

        return Response(data=output, status=status.HTTP_200_OK)
