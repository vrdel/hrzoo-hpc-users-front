from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from backend.serializers import SshKeysSerializer
from backend.models import SSHPublicKey

# TODO: dev only
from rest_framework.permissions import AllowAny


class SshKeys(APIView):
    # authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def get(self, request):
        serializer = SshKeysSerializer(SSHPublicKey.objects.filter(users=request.user.pk), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        request.data['users'] = request.user.pk
        serializer = SshKeysSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
