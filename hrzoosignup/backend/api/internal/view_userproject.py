from backend import serializers
from backend import models

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class UserProjectAPI(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        pass
