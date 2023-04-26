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

import json
import requests
import datetime
import logging

from django.core.cache import cache
from django.db import IntegrityError
from django.conf import settings


logger = logging.getLogger('hrzoosignup.views')


def associate_user_to_project(user, project):
    role_obj = models.Role.objects.get(name='collaborator')
    userproject_obj = models.UserProject(user=user, project=project,
                                         role=role_obj,
                                         date_joined=datetime.datetime.now())
    userproject_obj.save()


# INVITATIONS_SIGNUP_REDIRECT setting
# just return HTTP 200 OK here and that will return as back
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

            if ret.status_code == 200 and 'invites-userlink' in ret.url:
                Invitation = get_invitation_model()
                get_invite = Invitation.objects.get(key=kwargs['invitekey'])
                proj = get_invite.project
                inv_oib = get_invite.person_oib
                proj_type = models.ProjectType.objects.get(project=proj)

                if (proj_type.name == 'research-croris'):
                    if (inv_oib == request.user.person_oib):
                        associate_user_to_project(user, proj)

                        if settings.EMAIL_SEND:
                            useremail.email_approve_membership(get_invite.inviter.person_mail,
                                                               proj.name, user)

                        msg = {
                            'status': {
                                'code': status.HTTP_201_CREATED,
                                'message': '{} associated to project {}'.format(
                                    user.person_uniqueid,
                                    proj.identifier)
                        }}
                        logger.info(msg)
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

                else:
                    associate_user_to_project(user, proj)

                    if settings.EMAIL_SEND:
                        useremail.email_approve_membership(get_invite.inviter.person_mail,
                                                           proj.name, user)
                    msg = {
                        'status': {
                        'code': status.HTTP_201_CREATED,
                        'message': '{} associated to project {}'.format(
                                user.person_uniqueid,
                                proj.identifier)
                        }
                    }
                    logger.info(msg)
                    return Response(msg, status=status.HTTP_201_CREATED)

        except requests.exceptions.HTTPError as ex:
            if ex.response.status_code == 410:
                msg = {
                    'status': {
                        'code': status.HTTP_410_GONE,
                        'message': '{} - Invitation code already used'.format(user.username)}
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
            if proj_type.name == 'research-croris':
                myoib = request.user.person_oi
                cached = cache.get(f'{myoib}_croris')
                if not cached:
                    msg = {
                        'status': {
                            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                            'message': '{} - Problem fetching cached data'.format(request.user.username)
                        }
                    }
                    logger.error(msg)
                    return Response(msg, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                emails = [col['value'] for col in request.data['collaboratorEmails']]
                target = cached['projects_lead_users'][proj.croris_id]
                oib_map = dict()
                for user in target:
                    oib_map.update({user['email']: user['oib']})
                cached_emails = set()
                cached_emails.update([user['email'] for user in target])
                for email in emails:
                    if email in cached_emails:
                        invite = Invitation.create(email, inviter=request.user,
                                                   project=proj,
                                                   person_oib=oib_map[email])
                        invite.send_invitation(request)

            else:
                emails = [col['value'] for col in request.data['collaboratorEmails']]
                for email in emails:
                    invite = Invitation.create(email, inviter=request.user,
                                               project=proj, person_oib='')
                    invite.send_invitation(request)

            msg = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'message': '{} - Invitations sent'.format(request.user.username)
                }
            }
            logger.info(msg)
            return Response(msg, status=status.HTTP_200_OK)

        # TODO: what are all posible exceptions?
        except Exception as exc:
            msg = {
                'status': {
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': '{} - Invitations problem: {}'.format(user.username, repr(exc))
                }
            }
            logger.error(msg)
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
