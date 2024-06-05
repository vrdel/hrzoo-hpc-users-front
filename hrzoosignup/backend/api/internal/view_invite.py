from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from invitations.utils import get_invitation_model

from backend import models
from backend.email import user as useremail
from backend.serializers import InvitesSerializer
from backend.utils.gen_username import gen_username
from .view_croris import CroRISInfo

import json
import requests
import datetime
import logging

from django.core.cache import cache
from django.db import IntegrityError
from django.conf import settings
from django.utils import timezone


logger = logging.getLogger('hrzoosignup.views')


def associate_user_to_project(user, project):
    role_obj = models.Role.objects.get(name='collaborator')
    userproject_obj = models.UserProject(user=user, project=project,
                                         role=role_obj,
                                         date_joined=timezone.make_aware(datetime.datetime.now()))
    userproject_obj.save()
    user.status = True
    if not user.person_username:
        user.person_username = gen_username(user.first_name, user.last_name)
        logger.info(f"Generated username {user.person_username} for {user.username}")
    user.save()


# INVITATIONS_SIGNUP_REDIRECT setting
# just return HTTP 200 OK here and that will return us back
# in still authenticated context.
class InvitesLink(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def get(self, request, **kwargs):
        user = request.user.pk
        return Response('ok, get us back', status.HTTP_200_OK)


class InvitesSent(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        user = request.user
        myinvites = models.CustomInvitation.objects.filter(inviter=user)

        serializer = InvitesSerializer(myinvites, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, **kwargs):
        inviterem = request.data.get('type', None)
        if inviterem and inviterem == 'inviterem':
            try:
                target = models.CustomInvitation.objects.get(
                    email=request.data['email'],
                    inviter_id=request.user.id,
                    project_id=request.data['projectid']
                )
                target.delete()
                ok_response = {
                    'status': {
                        'code': status.HTTP_204_NO_CONTENT,
                        'message': f'{request.user.username} - Invitation successfully deleted'
                    }
                }
                return Response(ok_response, status=status.HTTP_204_NO_CONTENT)

            except models.CustomInvitation.DoesNotExist:
                err_response = {
                    'status': {
                        'code': status.HTTP_404_NOT_FOUND,
                        'message': '{} - Invitation not found'.format(request.user.username)
                    }
                }
                logger.error(err_response)
                return Response(err_response, status=status.HTTP_404_NOT_FOUND)


class Invites(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        user = request.user

        # hardcoding it here as
        # INVITATIONS_CONFIRMATION_URL_NAME did not help
        ret = requests.get('{}://{}/invitations/accept-invite/{}'.format(
            request.scheme,
            request.get_host(),
            kwargs['invitekey'],
        ))
        try:
            res = ret.raise_for_status()
            edugain_authn = False

            if request.session:
                edugain_authn = 'edugain' in request.session.get('saml2_idp', [])

            if ret.status_code == 200 and 'invites-userlink' in ret.url:
                Invitation = get_invitation_model()
                get_invite = Invitation.objects.get(key=kwargs['invitekey'])
                proj = get_invite.project
                inv_oib = get_invite.person_oib
                inv_type = get_invite.invtype or 'local'
                proj_type = models.ProjectType.objects.get(project=proj)

                # invitation is only for local collaborators
                if inv_type == 'local' and edugain_authn:
                    msg = {
                        'status': {
                            'code': status.HTTP_400_BAD_REQUEST,
                            'message': '{} - Invitation for local collaborators'.format(request.user.username)
                        }
                    }
                    logger.error(msg)
                    get_invite.accepted = False
                    get_invite.save()
                    return Response(msg, status=status.HTTP_400_BAD_REQUEST)

                # foreign collaborators must authn via eduGAIN
                if proj_type.name == 'research-croris' and inv_type == 'foreign' and not edugain_authn:
                    msg = {
                        'status': {
                            'code': status.HTTP_400_BAD_REQUEST,
                            'message': '{} - Invitation for foreign collaborators that must authn via eduGAIN'.format(request.user.username)
                        }
                    }
                    logger.error(msg)
                    get_invite.accepted = False
                    get_invite.save()
                    return Response(msg, status=status.HTTP_400_BAD_REQUEST)

                already_assigned = models.UserProject.objects.filter(
                    user__person_oib=user.person_oib,
                    project__id=proj.id
                )
                if len(already_assigned) > 0:
                    msg = {
                        'status': {
                            'code': status.HTTP_400_BAD_REQUEST,
                            'message': '{} - User {} already assigned to project'.format(request.user.username, user.username)
                        }
                    }
                    logger.error(msg)
                    return Response(msg, status=status.HTTP_400_BAD_REQUEST)

                if (proj_type.name == 'research-croris'):
                    if ((inv_oib == request.user.person_oib and inv_type == 'local') or
                       (inv_type == 'foreign' and edugain_authn)):
                        associate_user_to_project(user, proj)

                        if settings.EMAIL_SEND:
                            if get_invite.inviter.person_type == 'local':
                                useremail.email_approve_membership(get_invite.inviter.person_mail,
                                                                   proj.name, user)
                            elif get_invite.inviter.person_type == 'foreign':
                                useremail.email_approve_membership_en(get_invite.inviter.person_mail,
                                                                      proj.name,
                                                                      user)

                        msg = {
                            'status': {
                                'code': status.HTTP_201_CREATED,
                                'message': '{} associated to project {}'.format(
                                    user.person_uniqueid,
                                    proj.identifier)
                            }
                        }
                        logger.info(msg)
                        cache.delete("ext-users-projects")
                        cache.delete("usersinfoinactive-get")
                        cache.delete("usersinfo-get")
                        cache.delete("projects-get-all")
                        return Response(msg, status=status.HTTP_201_CREATED)

                    else:
                        msg = {
                            'status': {
                                'code': status.HTTP_403_FORBIDDEN,
                                'message': '{} could not be associated to project {} - OIB does not match'.format(
                                    user.person_uniqueid,
                                    proj.identifier)
                            }}
                        logger.warn(msg)
                        return Response(msg, status=status.HTTP_403_FORBIDDEN)

                elif (proj_type.name == 'research-institutional'):
                    user_crorisproject = models.UserProject.objects.filter(
                        user_id=request.user.id,
                        project__project_type__name='research-croris'
                    )
                    if user_crorisproject.count() > 0:
                        err_status = status.HTTP_403_FORBIDDEN
                        err_response = {
                            'status': {
                                'code': err_status,
                                'message': 'User CroRIS project'
                            }
                        }
                        return Response(err_response, status=err_status)

                    user_instituteproject = models.UserProject.objects.filter(
                        user_id=request.user.id,
                        project__project_type__name='research-institutional'
                    )
                    if user_instituteproject.count() > 0:
                        err_status = status.HTTP_403_FORBIDDEN
                        err_response = {
                            'status': {
                                'code': err_status,
                                'message': 'User institute project'
                            }
                        }
                        return Response(err_response, status=err_status)

                    croris_info = CroRISInfo()
                    croris_info.request = request
                    croris_resp = croris_info.get(request).data

                    if croris_resp:
                        projects_lead = croris_resp['data']['projects_lead_info']
                        projects_associate = croris_resp['data']['projects_associate_info']
                        if len(projects_lead) > 0:
                            err_status = status.HTTP_403_FORBIDDEN
                            err_response = {
                                'status': {
                                    'code': err_status,
                                    'message': 'Lead CroRIS project'
                                }
                            }
                            return Response(err_response, status=err_status)
                        if len(projects_associate) > 0:
                            err_status = status.HTTP_403_FORBIDDEN
                            err_response = {
                                'status': {
                                    'code': err_status,
                                    'message': 'Associate CroRIS project'
                                }
                            }
                            return Response(err_response, status=err_status)

                    associate_user_to_project(user, proj)

                    if settings.EMAIL_SEND:
                        if get_invite.inviter.person_type == 'local':
                            useremail.email_approve_membership(get_invite.inviter.person_mail,
                                                               proj.name, user)
                        elif get_invite.inviter.person_type == 'foreign':
                            useremail.email_approve_membership_en(get_invite.inviter.person_mail,
                                                                  proj.name,
                                                                  user)

                    msg = {
                        'status': {
                            'code': status.HTTP_201_CREATED,
                            'message': '{} associated to project {}'.format(
                                user.person_uniqueid,
                                proj.identifier)
                        }
                    }
                    logger.info(msg)
                    cache.delete("ext-users-projects")
                    cache.delete("usersinfoinactive-get")
                    cache.delete("usersinfo-get")
                    cache.delete("projects-get-all")
                    return Response(msg, status=status.HTTP_201_CREATED)

                else:
                    associate_user_to_project(user, proj)

                    if settings.EMAIL_SEND:
                        if get_invite.inviter.person_type == 'local':
                            useremail.email_approve_membership(get_invite.inviter.person_mail,
                                                               proj.name, user)
                        elif get_invite.inviter.person_type == 'foreign':
                            useremail.email_approve_membership_en(get_invite.inviter.person_mail,
                                                                  proj.name,
                                                                  user)
                    msg = {
                        'status': {
                            'code': status.HTTP_201_CREATED,
                            'message': '{} associated to project {}'.format(
                                user.person_uniqueid,
                                proj.identifier)
                        }
                    }
                    logger.info(msg)
                    cache.delete("ext-users-projects")
                    cache.delete("usersinfoinactive-get")
                    cache.delete("usersinfo-get")
                    cache.delete("projects-get-all")
                    return Response(msg, status=status.HTTP_201_CREATED)

        except requests.exceptions.HTTPError as ex:
            if ex.response.status_code == 410:
                msg = {
                    'status': {
                        'code': status.HTTP_410_GONE,
                        'message': '{} - Invitation code already used'.format(user.username)}
                }
                try:
                    Invitation = get_invitation_model()
                    get_invite = Invitation.objects.get(key=kwargs['invitekey'])
                except Invitation.DoesNotExist:
                    msg = {
                        'status': {
                            'code': status.HTTP_410_GONE,
                            'message': '{} - Invitation code expired'.format(user.username)}
                    }
                logger.error(msg)
                return Response(msg, status=status.HTTP_410_GONE)

        except IntegrityError as exc:
            msg = {
                'status': {
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': '{} - Invitations problem: {}'.format(user.username, repr(exc))
                }
            }
            logger.error(msg)
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        Invitation = get_invitation_model()

        request.data['user'] = request.user.pk
        proj_id = request.data['project']
        myprojs = models.UserProject.objects.filter(user=request.user)
        myprojs = set([upr.project.identifier for upr in myprojs])

        if proj_id not in myprojs:
            msg = {
                'status': {
                    'code': status.HTTP_403_FORBIDDEN,
                    'message': '{} - Not allowed to send invitations for given project'.format(request.user.username)
                }
            }
            logger.error(msg)
            return Response(msg, status=status.HTTP_403_FORBIDDEN)

        proj = models.Project.objects.get(identifier=proj_id)
        proj_type = models.ProjectType.objects.get(project=proj)

        try:
            record_invites = list()

            if proj_type.name == 'research-croris':
                emails = [col['value'] for col in request.data['collaboratorEmails']]
                foreign_emails = [col['value'] for col in request.data['foreignCollaboratorEmails']]
                myoib = request.user.person_oib
                cached = cache.get(f'{myoib}_croris')
                if not cached and emails:
                    msg = {
                        'status': {
                            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                            'message': '{} - Problem fetching cached data'.format(request.user.username)
                        }
                    }
                    logger.error(msg)
                    return Response(msg, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                if emails:
                    target = cached['projects_lead_users'][proj.croris_id]
                    oib_map = dict()
                    for user in target:
                        user_email = [user['email']]
                        if ';' in user['email']:
                            user_email = [email.strip() for email in user['email'].split(';')]
                        for email in user_email:
                            oib_map.update({email: user['oib']})
                    cached_emails = set()
                    for user in target:
                        indcache_emails = list()
                        if ';' in user['email']:
                            targ_emails = user['email'].split(';')
                            for email in targ_emails:
                                indcache_emails.append(email.strip())
                        else:
                            indcache_emails.append(user['email'])
                        cached_emails.update(indcache_emails)

                    for email in emails:
                        if email in cached_emails:
                            invite = Invitation.create(email, inviter=request.user,
                                                       project=proj,
                                                       person_oib=oib_map[email])
                            invite.send_invitation(request)
                            record_invites.append(invite)

                if foreign_emails:
                    for email in foreign_emails:
                        invite = Invitation.create(email, inviter=request.user,
                                                   project=proj)
                        invite.send_invitation(request)
                        record_invites.append(invite)

            else:
                emails = [col['value'] for col in request.data['collaboratorEmails']]
                for email in emails:
                    invite = Invitation.create(email, inviter=request.user,
                                               project=proj, person_oib='')
                    invite.send_invitation(request)
                    record_invites.append(invite)

            msg = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'message': '{} - Invitations sent {}'.format(request.user.username, repr([(inv.key, inv.email) for inv in record_invites]))
                }
            }
            logger.info(msg)
            return Response(msg, status=status.HTTP_200_OK)

        # TODO: what are all posible exceptions?
        except Exception as exc:
            msg = {
                'status': {
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': '{} - Invitations problem: {}'.format(request.user.username, repr(exc))
                }
            }
            logger.error(msg)
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
