from backend import serializers
from backend.models import SSHPublicKey

from django.core.cache import cache

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class SshKeysAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        ret_data = cache.get('ext-sshkeys')
        if ret_data:
            return Response(ret_data, status=status.HTTP_200_OK)

        serializer = serializers.SshKeysSerializer2(SSHPublicKey.objects.all(), many=True)
        cache.set('ext-sshkeys', serializer.data, 60 * 15)

        return Response(serializer.data, status=status.HTTP_200_OK)
