from backend import models
from backend import serializers
from backend.dbmodels.apikey import HRZOOHasAPIKey
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class UsersAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    serializer_class = serializers.UsersSerializerFiltered3

    def get(self, request):
        users = models.User.objects.all()
        serializer = serializers.UsersSerializerFiltered3(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
