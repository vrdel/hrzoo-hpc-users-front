from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

# TODO: dev only
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from backend import models
from backend.email import project
from backend.serializers import ProjectSerializer, ProjectSerializerGet, UserProjectSerializer
from backend.utils.gen_username import gen_username

import json
import datetime
import textwrap
import logging

logger = logging.getLogger('hrzoosignup.views')


class ProjectExtend(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def post(self, request, **kwargs):
        projid = kwargs.get('projid')
        pass

    def get(self, request, **kwargs):
        pass
