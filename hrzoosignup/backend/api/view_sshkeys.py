from backend import serializers
from backend.models import SSHPublicKey

from backend.caching import entries, store

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.dbmodels.apikey import HRZOOHasAPIKey


class SshKeysAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    serializer_class = serializers.SshKeysSerializer

    def get(self, request):
        ret_data = store.get(entries.EXTERNAL_SSH_KEYS)
        if ret_data is not None:
            return Response(ret_data, status=status.HTTP_200_OK)

        serializer = serializers.SshKeysSerializer(
            SSHPublicKey.objects.all(), many=True
        )
        store.set(entries.EXTERNAL_SSH_KEYS, serializer.data)

        return Response(serializer.data, status=status.HTTP_200_OK)
