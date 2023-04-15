from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status

from rest_framework.renderers import JSONRenderer

from invitations.utils import get_invitation_model

from backend.models import Project

import json
import requests


class Invites(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        user = request.user.pk

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
        except requests.exceptions.HTTPError as ex:
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

        proj = Project.objects.get(identifier='P-TIA-PERF-HZ2')

        invite = Invitation.create('daniel.vrcic@gmail.com', inviter=request.user, project=proj)
        invite.send_invitation(request)

        return Response({
            'message': 'Invitation sent'
        })
