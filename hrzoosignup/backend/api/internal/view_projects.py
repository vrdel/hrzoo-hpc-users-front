from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# TODO: dev only
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from backend.serializers import ProjectSerializer, ProjectSerializerGet, UserProjectSerializer
from backend import models
from backend.email import project

import json
import datetime
import textwrap
import logging


logger = logging.getLogger('hrzoosignup.views')


class ProjectsGeneral(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        state_obj = models.State.objects.get(name=request.data['state'])

        request.data['state'] = state_obj.pk
        request.data['is_active'] = True
        request.data['date_submitted'] = timezone.now()

        # fixed project identifier in format NR-<year>-<month<-<count_posted>
        cobj = models.ProjectCount.objects.get()
        request.data['identifier'] = 'NR-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)

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
                                                 date_joined=timezone.now())
            userproject_obj.save()
            cobj.counter += 1
            cobj.save()

            if settings.EMAIL_SEND:
                project.email_new_project(project_ins.name, request.user,
                                          project_ins.project_type,
                                          project_ins.identifier)

            cache.delete('projects-get-all')
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
        request.data['date_submitted'] = timezone.now()

        if not request.data['croris_identifier']:
            cobj = models.ProjectCount.objects.get()
            code = 'NRC-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)
            request.data['identifier'] = code
            request.data['croris_identifier'] = code
        else:
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
                                                 date_joined=timezone.now())
            userproject_obj.save()

            if settings.EMAIL_SEND:
                project.email_new_project(project_ins.name, request.user,
                                          project_ins.project_type,
                                          project_ins.identifier)

            cache.delete('projects-get-all')
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
            p_obj.name = request.data['requestName']
            p_obj.reason = request.data['requestExplain']
            p_obj.resources_type = request.data['requestResourceType']
            p_obj.state = state
            p_obj.science_field = request.data['scientificDomain']
            p_obj.science_software = request.data['scientificSoftware']
            p_obj.science_extrasoftware = request.data['scientificSoftwareExtra']
            p_obj.science_extrasoftware_help = request.data['scientificSoftwareHelp']
            p_obj.staff_resources_type = request.data.get('staff_requestResourceType')
            p_obj.resources_numbers = request.data['resources_numbers']

            if state.name == 'deny':
                staff_comment = request.data.get('staff_comment')
                p_obj.denied_by = {
                    'first_name': self.request.user.first_name,
                    'last_name': self.request.user.last_name,
                    'person_uniqueid': self.request.user.person_uniqueid,
                    'username': self.request.user.username
                }
                if settings.EMAIL_SEND and request.data['staff_emailSend']:
                    userproj = p_obj.userproject_set.filter(project=p_obj.id).filter(role__name='lead')
                    person_mail = userproj[0].user.person_mail
                    project.email_deny_project(person_mail, p_obj.name,
                                               p_obj.project_type,
                                               staff_comment)

            if state.name == 'approve':
                p_obj.approved_by = {
                    'first_name': self.request.user.first_name,
                    'last_name': self.request.user.last_name,
                    'person_uniqueid': self.request.user.person_uniqueid,
                    'username': self.request.user.username
                }
                if settings.EMAIL_SEND and request.data['staff_emailSend']:
                    userproj = p_obj.userproject_set.filter(project=p_obj.id).filter(role__name='lead')
                    person_mail = userproj[0].user.person_mail
                    project.email_approve_project(person_mail, p_obj.name,
                                                  p_obj.project_type)

            serializer = ProjectSerializer(p_obj, data=request.data)
            if serializer.is_valid():
                p_obj.date_changed = timezone.now()
                p_obj.save()
                if request.data.get('staff_comment') and state.name == 'deny':
                    comment = request.data.get('staff_comment')
                    sc = models.StaffComment.objects.create(
                        comment=comment,
                        date=timezone.now(),
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
                cache.delete('projects-get-all')
                return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, **kwargs):
        projects = list()
        projects_research = list()

        try:
            if kwargs.get('specific', False):
                req_type = kwargs.get('specific')

                if req_type == 'all' and (request.user.is_staff or request.user.is_superuser):
                    serializer = ProjectSerializerGet(models.Project.objects.all().order_by('-date_submitted'), many=True)
                    ret_data = cache.get('projects-get-all')
                    if ret_data:
                        return Response(ret_data, status=status.HTTP_200_OK)
                    else:
                        cache.set('projects-get-all', serializer.data, 60 * 15)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    serializer = ProjectSerializerGet(models.Project.objects.get(identifier=req_type))
                    return Response(serializer.data, status=status.HTTP_200_OK)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': '{} - Project not found'.format(request.user.username)
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        up_obj = models.UserProject.objects.filter(user=request.user.pk).order_by('-project__date_submitted')
        for up in up_obj:
            projects.append(up.project)
            if (up.project.project_type.name == 'research-croris'
                and up.role.name == 'lead'
                and up.project.state.name == 'approve'):
                projects_research.append(up.project)

        # sync data for CroRIS projects that might have been updated
        # since submission
        oib = request.user.person_oib
        croris_data = cache.get(f'{oib}_croris')
        if croris_data:
            lead_projects_users = croris_data['projects_lead_users']
            lead_info = croris_data['projects_lead_info']
            for pl in projects_research:
                # TODO: proper date + time, otherwise time=22h
                # plinfo = [project for project in lead_info if project['croris_id'] == pl.croris_id]
                # pl.date_end = datetime.datetime.strptime(plinfo['end'], '%d.%m.%Y')
                try:
                    pl.croris_collaborators = lead_projects_users[pl.croris_id]
                    pl.save()
                except (KeyError, IndexError) as exc:
                    logger.warn('{} - found project data (CroRIS ID={}) in database, but not in memcache'.format(request.user.username, pl.croris_id))

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
                    cache.delete('projects-get-all')
                    return Response(status=status.HTTP_204_NO_CONTENT)
                else:
                    err_response = {
                        'status': {
                            'code': status.HTTP_401_UNAUTHORIZED,
                            'message': '{} - Not allowed to delete project'.format(request.user.username)
                        }
                    }
                    return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': '{} - Project not found'.format(request.user.username)
                }
            }
            logger.error(err_response)
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
                        'message': '{} - Role needed'.format(request.user.username)
                    }
                }
                logger.error(err_response)
                return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Project.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': '{} - Project not found'.format(request.user.username)
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        except models.Role.DoesNotExist as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': '{} - Role not found'.format(request.user.username)
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)


class CanSubmitInstitutionalProject(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        projects_enddates = dict()
        oib = request.user.person_oib

        croris_data = cache.get(f'{oib}_croris')

        if croris_data:
            for pr in croris_data['projects_lead_info']:
                projects_enddates.update({
                    pr['identifier']: pr['end']
                })

        interest_projects = models.Project.objects.filter(users__id__exact=request.user.pk).values_list('croris_identifier', 'date_end')
        interest_projects = list(interest_projects)
        for approved_pr in interest_projects:
            if approved_pr[0] not in projects_enddates:
                projects_enddates.update({
                    approved_pr[0]: approved_pr[1]
                })

        return Response(projects_enddates, status=status.HTTP_200_OK)
