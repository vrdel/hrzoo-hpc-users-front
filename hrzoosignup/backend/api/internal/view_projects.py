from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# TODO: dev only
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.core.cache import cache

from backend.serializers import ProjectSerializer, ProjectSerializerGet, UserProjectSerializer
from backend import models

import json
import datetime


class ProjectsGeneral(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        state_obj = models.State.objects.get(name=request.data['state'])

        request.data['state'] = state_obj.pk
        request.data['is_active'] = True
        request.data['date_submitted'] = datetime.datetime.now()

        # fixed project identifier in format NR-<year>-<month<-<count_posted>
        cobj = models.ProjectCount.objects.get()
        request.data['identifier'] = 'NR-{}-{:03}'.format(datetime.datetime.now().strftime('%Y-%m'), cobj.counter)

        type_obj = models.ProjectType.objects.get(name=request.data['project_type'])
        request.data['project_type'] = type_obj.pk

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
            cobj.counter += 1
            cobj.save()

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


class ProjectsResearch(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        oib = request.user.person_oib

        # TODO: validate date data picked up from frontend with the CroRIS cached
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
        request.data['date_submitted'] = datetime.datetime.now()
        request.data['identifier'] = request.data['croris_identifier']
        request.data['institute'] = request.data['croris_institute']

        type_obj = models.ProjectType.objects.get(name=request.data['project_type'])
        request.data['project_type'] = type_obj.pk

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
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def post(self, request, **kwargs):
        req_type = kwargs.get('specific')
        if (request.user.is_staff or request.user.is_superuser):
            p_obj = models.Project.objects.get(identifier=req_type)
            for (key, value) in request.data['requestState'].items():
                if value == True:
                    break
            state = models.State.objects.get(name=key)
            # TODO:
            # update writing rest of fields so that we can enable "editing" on
            # frontend side
            p_obj.reason = request.data['reason']
            p_obj.resources_type = request.data['resources_type']
            p_obj.state = state
            p_obj.staff_resources_type = request.data.get('staff_resources_type')
            if state.name == 'deny':
                p_obj.denied_by = {
                    'first_name': self.request.user.first_name,
                    'last_name': self.request.user.last_name,
                    'person_uniqueid': self.request.user.person_uniqueid,
                    'username': self.request.user.username
                }
            if state.name == 'approve':
                p_obj.approved_by = {
                    'first_name': self.request.user.first_name,
                    'last_name': self.request.user.last_name,
                    'person_uniqueid': self.request.user.person_uniqueid,
                    'username': self.request.user.username
                }
            serializer = ProjectSerializer(p_obj, data=request.data)
            if serializer.is_valid():
                p_obj.date_changed = datetime.datetime.now()
                p_obj.save()
                if request.data.get('staff_comment') and state.name == 'deny':
                    comment = request.data.get('staff_comment')
                    sc = models.StaffComment.objects.create(
                        comment=comment,
                        date=datetime.datetime.now(),
                        project_state=state.name,
                        project_id = p_obj.pk,
                        comment_by={
                            'first_name': self.request.user.first_name,
                            'last_name': self.request.user.last_name,
                            'person_uniqueid': self.request.user.person_uniqueid,
                            'username': self.request.user.username,
                        }
                    )
                    p_obj.staff_comment = sc
                    sc.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, **kwargs):
        projects = list()

        try:
            if kwargs.get('specific', False):
                req_type = kwargs.get('specific')
                if req_type == 'all' and (request.user.is_staff or request.user.is_superuser):
                    serializer = ProjectSerializerGet(models.Project.objects.all().order_by('-date_submitted'), many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    serializer = ProjectSerializerGet(models.Project.objects.get(identifier=req_type))
                    return Response(serializer.data, status=status.HTTP_200_OK)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': 'Project not found'
                }
            }
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        up_obj = models.UserProject.objects.filter(user=request.user.pk).order_by('-project__date_submitted')
        for up in up_obj:
            projects.append(up.project)

        serializer = ProjectSerializerGet(projects, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, **kwargs):
        try:
            if kwargs.get('specific', False):
                req_id = kwargs.get('specific')
                if request.user.is_staff or request.user.is_superuser:
                    proj = models.Project.objects.get(identifier=req_id)
                    models.UserProject.objects.filter(project=proj).delete()
                    proj.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
                else:
                    err_response = {
                        'status': {
                            'code': status.HTTP_401_UNAUTHORIZED,
                            'message': 'Not allowed to delete project'
                        }
                    }
                    return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': 'Project not found'
                }
            }
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)


class ProjectsRole(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def get(self, request, **kwargs):
        projects = list()

        try:
            if kwargs.get('targetrole', False):
                role = kwargs.get('targetrole')
                role_obj = models.Role.objects.get(name=role)
                up_obj = models.UserProject.objects.filter(user=request.user.pk).filter(role=role_obj.pk).order_by('-project__date_submitted')
                for up in up_obj:
                    projects.append(up.project)

                serializer = ProjectSerializerGet(projects, many=True)

                return Response(serializer.data, status=status.HTTP_200_OK)

            else:
                err_response = {
                    'status': {
                        'code': status.HTTP_400_BAD_REQUEST,
                        'message': 'Role needed'
                    }
                }
                return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': 'Project not found'
                }
            }
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Role.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': 'Role not found'
                }
            }
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)
