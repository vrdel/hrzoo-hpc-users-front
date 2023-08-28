import datetime

from backend import models
from backend import serializers
from backend.models import SSHPublicKey

from dateutil.relativedelta import relativedelta

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


def get_todays_datetime():
    return datetime.datetime.now()


def filter_active_projects(projects):
    return [
        project for project in projects if
        project.state.name == "approve" and (
            project.date_end > get_todays_datetime() or (
                len(models.DateExtend.objects.filter(project=project)) > 0 and (
                    project.date_end + relativedelta(months=+6)
                ) > get_todays_datetime()
            )
        )
    ]


class SshKeysAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        serializer = serializers.SshKeysSerializer2(SSHPublicKey.objects.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
