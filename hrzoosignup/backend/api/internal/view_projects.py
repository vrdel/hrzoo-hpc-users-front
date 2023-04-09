from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# TODO: dev only
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.core.cache import cache

from backend.serializers import ProjectSerializer

import json
import datetime


class ProjectsResearch(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def __init__(self):
        pass

    def post(self, request):
        oib = request.user.person_oib
        # TODO: validate data picked up from frontend with the CroRIS cached
        # data
        croris_data = cache.get('{oib}_croris')

        request.data['is_active'] = True
        request.data['users'] = request.user.pk
        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            from pudb.remote import set_trace; set_trace(host='0.0.0.0')

            err_status = status.HTTP_400_BAD_REQUEST
            err_response = {
                'status': {
                    'code': err_status,
                    'message': json.dumps(serializer.errors)
                }
            }
            return Response(err_response, status=err_status)


class Projects(APIView):
    # authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def __init__(self):
        pass

    def post(self, request):
        pass
