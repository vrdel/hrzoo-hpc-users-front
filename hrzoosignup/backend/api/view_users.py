import datetime

from dateutil.relativedelta import relativedelta

from backend import models
from backend import serializers

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class UsersAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        users = models.User.objects.all()
        serializer = serializers.UsersSerializerFiltered3(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
