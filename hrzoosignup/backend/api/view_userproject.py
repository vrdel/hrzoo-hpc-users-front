from backend import serializers
from backend import models

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class UserProjectAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        serializer = serializers.UserProjectSerializer2(models.UserProject.objects.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
