from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from backend.serializers import SshKeysSerializer
from backend.models import SSHPublicKey

import json


class SshKeys(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = SshKeysSerializer(SSHPublicKey.objects.filter(user=request.user.pk), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        key_name = request.data['name']
        user_keys = SSHPublicKey.objects.filter(user=request.user.pk)
        user_key = user_keys.get(name=key_name)
        user_key.delete()
        ok_response = {
            'status': {
                'code': status.HTTP_204_NO_CONTENT,
                'message': f'{key_name} successfully deleted'
            }
        }
        return Response(ok_response, status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        request.data['user'] = request.user.pk
        serializer = SshKeysSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
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
