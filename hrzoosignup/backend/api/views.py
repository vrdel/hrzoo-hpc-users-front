from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from backend import models
from backend import serializers

from django.core.cache import cache


class IsSessionActive(APIView):
    def get(self, request):
        userdetails = dict()

        if (isinstance(self.request.user, AnonymousUser)
            and self.request.auth is None):
            return Response(
                {"active": False, "error": "Session not active" },
                status=status.HTTP_403_FORBIDDEN)
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            # TODO: remove - testing only
            cache.set(f'{user.username}_oib', open('./oib').readlines(), 3600 * 5)

            return Response(
                {'active': True, 'userdetails': userdetails})


