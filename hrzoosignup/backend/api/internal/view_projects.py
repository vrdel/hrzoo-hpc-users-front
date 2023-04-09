from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.conf import settings

import json
import datetime


class Projects(APIView):
    def __init__(self):
        pass

    def post(self, request):
        pass
