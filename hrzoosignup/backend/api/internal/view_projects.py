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
from backend import models

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
        if croris_data:
            lead_status = croris_data['person_info']['lead_status']
            if not lead_status:
                unauthz_response = {
                    'status': {
                        'code': status.HTTP_401_UNAUTHORIZED,
                        'message': 'Not registered leader of any project in CroRIS'
                    }
                }
                return Response(unauthz_response, status=status.HTTP_401_UNAUTHORIZED)

            lead_projects = list(map(lambda p: p['croris_id'], croris_data['projects_lead_info']))
            if int(request.data['croris_id']) not in lead_projects:
                unauthz_response = {
                    'status': {
                        'code': status.HTTP_401_UNAUTHORIZED,
                        'message': 'You are not registered leader of this project in CroRIS'
                    }
                }
                return Response(unauthz_response, status=status.HTTP_401_UNAUTHORIZED)

            project_leads = croris_data['projects_lead_info']

        state_obj = models.State.objects.get(name=request.data['state'])
        request.data['state'] = state_obj.pk
        request.data['is_active'] = True

        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            project_ins = serializer.instance
            role_obj = models.Role.objects.get(name='lead')
            userproject_obj = models.UserProject(user=request.user,
                                                 project=project_ins,
                                                 role=role_obj,
                                                 date_joined=datetime.datetime.now())
            userproject_obj.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
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
