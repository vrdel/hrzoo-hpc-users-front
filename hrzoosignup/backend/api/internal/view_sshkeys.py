from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from backend.serializers import SshKeysSerializer
from backend.models import SSHPublicKey
from backend.email import sshkey as keyemail
from backend import models

from django.conf import settings
from django.db import IntegrityError

import json
import logging


logger = logging.getLogger('hrzoosignup.views')


class SshKeys(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        if not kwargs:
            serializer = SshKeysSerializer(SSHPublicKey.objects.filter(user=request.user.pk), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (kwargs.get('all', False)
              and (request.user.is_staff or request.user.is_superuser)):
            serializer = SshKeysSerializer(SSHPublicKey.objects.all(), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            err_status = status.HTTP_400_BAD_REQUEST
            err_response = {
                'status': {
                    'code': err_status,
                    'message': '{} - Bad request'.format(request.user.username)
                }
            }
            return Response(err_response, status=err_status)

    def delete(self, request):
        key_name = request.data['name']
        user_keys = SSHPublicKey.objects.filter(user=request.user.pk)
        user_key = user_keys.get(name=key_name)
        user_key.delete()
        ok_response = {
            'status': {
                'code': status.HTTP_204_NO_CONTENT,
                'message': f'{request.user.username} - {key_name} successfully deleted'
            }
        }
        return Response(ok_response, status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        request.data['user'] = request.user.pk

        interested_states = models.State.objects.filter(name__in=['approve', 'extend'])
        up_obj = models.UserProject.objects\
            .filter(user=request.user.pk)\
            .filter(project__state__in=interested_states)

        if not up_obj:
            err_status = status.HTTP_401_UNAUTHORIZED
            err_response = {
                'status': {
                    'code': err_status,
                    'message': '{} - Not authorized to add new SSH key'.format(request.user.username)
                }
            }
            return Response(err_response, status=err_status)

        serializer = SshKeysSerializer(data=request.data)

        if serializer.is_valid():
            try:
                serializer.save()
                if settings.EMAIL_SEND:
                    keyemail.email_add_sshkey(request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except IntegrityError as exc:
                msg = {
                    'status': {
                        'code': status.HTTP_400_BAD_REQUEST,
                        'message': '{} - SSH key problem: {}'.format(request.user.username, repr(exc))
                    }
                }
                return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        else:
            err_status = status.HTTP_400_BAD_REQUEST
            err_response = {
                'status': {
                    'code': err_status,
                    'message': request.user.username + ' - ' + json.dumps(serializer.errors)
                }
            }
            return Response(err_response, status=err_status)
