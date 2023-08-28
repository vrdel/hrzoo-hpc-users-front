import datetime

from backend import models
from backend import serializers

from dateutil.relativedelta import relativedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey

from .view_users import UsersAPI
from .view_projects import ProjectsAPI
from .view_sshkeys import SshKeysAPI


class IsSessionActive(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        userdetails = dict()

        if isinstance(self.request.user, AnonymousUser) and \
                self.request.auth is None:
            return Response(
                {
                    "active": False,
                    "error": "Session not active"
                },
                status=status.HTTP_200_OK
            )
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            return Response(
                {
                    'active': True,
                    'userdetails': userdetails,
                    'csrftoken': get_token(request)
                },
                status=status.HTTP_200_OK)
