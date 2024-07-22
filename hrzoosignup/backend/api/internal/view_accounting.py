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
                "resource_name",
                "end_time",
                "accounting_record__cpuh",
                "accounting_record__gpuh"
            )
        )

        df = df.rename(columns={
            "project__identifier": "project",
            "resource_name": "resource",
            "accounting_record__cpuh": "cpuh",
            "accounting_record__gpuh": "gpuh"
        })

        df["tt"] = df.apply(
            lambda rec: f"{rec['end_time'].month:02d}/{rec['end_time'].year}",
            axis=1
        )

        df = df.sort_values(by=["tt"])

        resources = df["resource"].unique()

        output = dict()
        for resource in resources:
            cpuh = list()
            gpuh = list()
            df_resource = df[df["resource"] == resource]

            months = df_resource["tt"].unique()
            for month in months:
                df_month = df_resource[df_resource["tt"] == month]
                projects = df_month["project"].unique()

                cpu_dict = dict()
                gpu_dict = dict()
                for project in projects:
                    df_project = df_month[df_month["project"] == project]
                    proj_cpuh = float(df_project["cpuh"].sum(axis=0))
                    proj_gpuh = float(df_project["gpuh"].sum(axis=0))
                    if proj_cpuh > 0:
                        if "month" not in cpu_dict:
                            cpu_dict.update({"month": month})

                        cpu_dict.update({project: proj_cpuh})

                    if proj_gpuh > 0:
                        if "month" not in gpu_dict:
                            gpu_dict.update({"month": month})

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
