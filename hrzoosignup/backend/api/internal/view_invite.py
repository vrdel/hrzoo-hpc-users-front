from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from invitations.utils import get_invitation_model

from backend import models

import json
import requests
import datetime


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


class Invites(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        user = request.user

        # hardcoding it here as
        # INVITATIONS_CONFIRMATION_URL_NAME did not help
        # -vrdel
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
                associate_user_to_project(user, proj)

                return Response({
                    'status': {
                        'code': status.HTTP_201_CREATED,
                        'message': '{} associated to project {}'.format(
                            user.person_uniqueid,
                            proj.identifier)
                    }},
                    status=status.HTTP_200_OK
                )

        except requests.exceptions.HTTPError as ex:
            if (ex.response.status_code == 403
                and 'invites-userlink' in ex.response.url):
                return Response({
                    'status': {
                        'code': status.HTTP_201_CREATED,
                        'message': 'Invitation code used, user associated to invited project'
                    }},
                    status=status.HTTP_200_OK
                )

            if ex.response.status_code == 410:
                return Response({
                    'status': {
                        'code': status.HTTP_410_GONE,
                        'message': 'Invitation code already used'
                    }},
                    status=status.HTTP_410_GONE
                )

        return Response(status.HTTP_200_OK)

    def post(self, request):
        request.data['user'] = request.user.pk

        Invitation = get_invitation_model()

        proj = models.Project.objects.get(identifier='NR-2023-04-001')

        invite = Invitation.create('daniel.vrcic@gmail.com', inviter=request.user, project=proj)
        invite.send_invitation(request)

        return Response({
            'message': 'Invitation sent'
        })
