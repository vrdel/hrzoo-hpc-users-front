from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny

from backend import models
from backend import serializers

from django.core.cache import cache


class IsSessionActive(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        userdetails = dict()

        if (isinstance(self.request.user, AnonymousUser)
            and self.request.auth is None):
            return Response(
                {"active": False, "error": "Session not active" },
                status=status.HTTP_200_OK)
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            return Response(
                {'active': True, 'userdetails': userdetails},
                status=status.HTTP_200_OK)
