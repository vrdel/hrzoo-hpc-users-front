from django.contrib.auth import get_user_model

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from backend import models
from backend import serializers


class IsSessionActive(APIView):
    def get(self, request):
        userdetails = dict()

        try:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            return Response({'active': True, 'userdetails': userdetails})

        except get_user_model().DoesNotExist:

            return Response({"error": "Wrong credentials" }, status=status.HTTP_404_NOT_FOUND)


