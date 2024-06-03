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


class ProjectsGeneral(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if request.user.person_type == 'foreign':
            err_status = status.HTTP_401_UNAUTHORIZED
            err_response = {
                'status': {
                    'code': err_status,
                    'message': 'Not allowed to submit project'
                }
            }
            return Response(err_response, status=err_status)

        state_obj = models.State.objects.get(name=request.data['state'])

        request.data['state'] = state_obj.pk
        request.data['is_active'] = False
        request.data['date_submitted'] = timezone.now()

        type_obj = models.ProjectType.objects.get(name=request.data['project_type'])

        # fixed project identifier in format NR-<year>-<month<-<count_posted>
        cobj = models.ProjectCount.objects.get()
        if type_obj.name == 'research-institutional':
            request.data['identifier'] = 'NRI-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)
        elif type_obj.name == 'internal':
            request.data['identifier'] = 'NRM-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)
        elif type_obj.name == 'srce-workshop':
            request.data['identifier'] = 'NRR-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)
        else:
            request.data['identifier'] = 'NR-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)

        if type_obj.name == 'internal' or type_obj.name == 'srce-workshop':
            if not request.user.is_staff and not request.user.is_superuser:
                err_status = status.HTTP_401_UNAUTHORIZED
                err_response = {
                    'status': {
                        'code': err_status,
                        'message': 'Not allowed to submit internal or srce-workshop project'
                    }
                }
                return Response(err_response, status=err_status)

        if type_obj.name == 'research-institutional':
            user_crorisproject = models.UserProject.objects.filter(
                user_id=request.user.id,
                project__project_type__name='research-croris'
            )
            user_instituteproject = models.UserProject.objects.filter(
                user_id=request.user.id,
                project__project_type__name='research-institutional'
            )
            if user_instituteproject.count() > 0 or user_crorisproject.count() > 0:
                err_status = status.HTTP_401_UNAUTHORIZED
                err_response = {
                    'status': {
                        'code': err_status,
                        'message': 'Not allowed to submit institute project'
                    }
                }
                return Response(err_response, status=err_status)

            oib = request.user.person_oib
            croris_data = cache.get(f'{oib}_croris')
            if croris_data:
                mbz = croris_data['person_info'].get('mbz', None)
                projects_lead = croris_data.get('projects_lead_info', None)
                projects_associate = croris_data.get('projects_associate_info', None)
                if (not mbz
                    or (projects_lead and len(projects_lead) > 0)
                    or (projects_associate and len(projects_associate) > 0)):
                    err_status = status.HTTP_401_UNAUTHORIZED
                    err_response = {
                        'status': {
                            'code': err_status,
                            'message': 'Not allowed to submit institute project'
                        }
                    }
                    return Response(err_response, status=err_status)

            start = datetime.datetime.strptime(request.data['date_start'], '%Y-%m-%d')
            end = datetime.datetime.strptime(request.data['date_end'], '%Y-%m-%d')
            days = (end - start).days
            if days != 365 and days != 366:
                err_status = status.HTTP_400_BAD_REQUEST
                err_response = {
                    'status': {
                        'code': err_status,
                        'message': 'Length should be exactly one year period'
                    }
                }
                return Response(err_response, status=err_status)

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
            cache.delete("ext-users-projects")
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
        request.data['is_active'] = False
        request.data['date_submitted'] = timezone.now()

        if not request.data['croris_identifier']:
            cobj = models.ProjectCount.objects.get()
            code = 'NRC-{}-{:03}'.format(timezone.now().strftime('%Y-%m'), cobj.counter)
            request.data['identifier'] = code
            request.data['croris_identifier'] = code
        else:
            request.data['identifier'] = request.data['croris_identifier']

        for ins in request.data['croris_institute']:
            if ins['class'] == 'nositelj':
                request.data['institute'] = ins['name']
        else:
            request.data['institute'] = request.data['croris_institute'][0]['name']

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
            cache.delete("ext-users-projects")
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

            # already approved request, we're changing it
            original_values = None
            if p_obj.approved_by:
                original_values = json.loads(JSONRenderer().render(ProjectSerializer(p_obj).data))
                original_values.pop('changed_by')
                original_values.pop('change_history')

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
            p_obj.date_start = request.data['date_start']
            p_obj.date_end = request.data['date_end']

            userproj = p_obj.userproject_set.filter(project=p_obj.id).filter(role__name='lead')
            lead_user = userproj[0].user

            if state.name == 'deny':
                staff_comment = request.data.get('staff_comment')
                p_obj.denied_by = {
                    'first_name': self.request.user.first_name,
                    'last_name': self.request.user.last_name,
                    'person_uniqueid': self.request.user.person_uniqueid,
                    'username': self.request.user.username
                }
                p_obj.is_active = False
                if settings.EMAIL_SEND and request.data['staff_emailSend']:
                    person_mail = lead_user.person_mail
                    if lead_user.person_type == 'local':
                        project.email_deny_project(person_mail, p_obj.name,
                                                   p_obj.project_type,
                                                   staff_comment)
                    elif lead_user.person_type == 'foreign':
                        project.email_deny_project_en(person_mail, p_obj.name,
                                                      p_obj.project_type,
                                                      staff_comment)

            if state.name == 'approve':
                if not p_obj.approved_by:
                    p_obj.approved_by = {
                        'first_name': self.request.user.first_name,
                        'last_name': self.request.user.last_name,
                        'person_uniqueid': self.request.user.person_uniqueid,
                        'username': self.request.user.username
                    }
                    p_obj.date_approved = timezone.now()
                if settings.EMAIL_SEND and request.data['staff_emailSend']:
                    person_mail = lead_user.person_mail
                    if lead_user.person_type == 'local':
                        project.email_approve_project(person_mail, p_obj.name,
                                                      p_obj.project_type)
                    elif lead_user.person_type == 'foreign':
                        project.email_approve_project_en(person_mail,
                                                         p_obj.name,
                                                         p_obj.project_type)
                lead_user.status = True
                if not lead_user.person_username:
                    lead_user.person_username = gen_username(lead_user.first_name, lead_user.last_name)
                    logger.info(f"Generated username {lead_user.person_username} for {lead_user.username}")
                p_obj.is_active = True
                lead_user.save()

            if state.name == 'expire' or state.name == 'submit':
                p_obj.is_active = False
            elif state.name == 'extend':
                p_obj.is_active = True

            serializer = ProjectSerializer(p_obj, data=request.data)
            if serializer.is_valid():
                if original_values:
                    p_obj.changed_by = {
                        'first_name': self.request.user.first_name,
                        'last_name': self.request.user.last_name,
                        'person_uniqueid': self.request.user.person_uniqueid,
                        'username': self.request.user.username
                    }
                    next_values = json.loads(JSONRenderer().render(serializer.data))
                    next_values.pop('change_history')
                    if p_obj.change_history:
                        changes = p_obj.change_history
                        changes.append({
                            'previous': original_values,
                            'next': next_values,
                            'who': p_obj.changed_by,
                            'date': timezone.now().isoformat()
                        })
                        p_obj.change_history = changes
                    else:
                        p_obj.change_history = [{
                            'previous': original_values,
                            'next': next_values,
                            'who': p_obj.changed_by,
                            'date': timezone.now().isoformat()
                        }]

                p_obj.date_changed = timezone.now()
                p_obj.save()
                if request.data.get('staff_comment') and state.name == 'deny':
                    comment = request.data.get('staff_comment')
                    sc = models.StaffComment.objects.create(
                        comment=comment,
                        date=timezone.now(),
                        project_state=state.name,
                        project_id=p_obj.pk,
                        comment_by={
                            'first_name': self.request.user.first_name,
                            'last_name': self.request.user.last_name,
                            'person_uniqueid': self.request.user.person_uniqueid,
                            'username': self.request.user.username,
                        }
                    )
                    p_obj.staff_comment = sc
                    sc.save()
                cache.delete("ext-users-projects")
                cache.delete('projects-get-all')
                cache.delete("usersinfoinactive-get")
                cache.delete("usersinfo-get")
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
                        cache.set('projects-get-all', serializer.data, None)
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
                    cache.delete("ext-users-projects")
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


class CanSubmitInstituteProject(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        user_crorisproject = models.UserProject.objects.filter(
            user_id=request.user.id,
            project__project_type__name='research-croris'
        )
        if user_crorisproject.count() > 0:
            deny_resp = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'operation': 'DENY',
                    'message': 'Access CroRIS'
                }
            }
            return Response(deny_resp, status=status.HTTP_200_OK)

        user_instituteproject = models.UserProject.objects.filter(
            user_id=request.user.id,
            project__project_type__name='research-institutional',
            role__name='lead'
        )
        if user_instituteproject.count() > 0:
            deny_resp = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'operation': 'DENY',
                    'message': 'Already submitted'
                }
            }
            return Response(deny_resp, status=status.HTTP_200_OK)

        oib = request.user.person_oib
        croris_data = cache.get(f'{oib}_croris')

        if croris_data:
            mbz = croris_data['person_info'].get('mbz', None)
            if not mbz:
                deny_resp = {
                    'status': {
                        'code': status.HTTP_200_OK,
                        'operation': 'DENY',
                        'message': 'MBZ unknown'
                    }
                }
                return Response(deny_resp, status=status.HTTP_200_OK)

            projects_lead = croris_data.get('projects_lead_info', None)
            if projects_lead and len(projects_lead) > 0:
                deny_resp = {
                    'status': {
                        'code': status.HTTP_200_OK,
                        'operation': 'DENY',
                        'message': 'Lead CroRIS project',
                    }
                }
                return Response(deny_resp, status=status.HTTP_200_OK)

            projects_associate = croris_data.get('projects_associate_info', None)
            if projects_associate and len(projects_associate) > 0:
                deny_resp = {
                    'status': {
                        'code': status.HTTP_200_OK,
                        'operation': 'DENY',
                        'message': 'Associate CroRIS project',
                    }
                }
                return Response(deny_resp, status=status.HTTP_200_OK)

            allow_resp = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'operation': 'ALLOW',
                    'message': 'Can submit institute project',
                }
            }
            return Response(allow_resp, status=status.HTTP_200_OK)

        else:
            no_data_resp = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'operation': 'DENY',
                    'message': 'No CroRIS data'
                }
            }
            return Response(no_data_resp, status=status.HTTP_200_OK)
