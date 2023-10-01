from backend import serializers
from backend import models

from django.core.cache import cache

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class UserProjectAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        ret_data = cache.get('ext-users-projects')
        if ret_data:
            return Response(ret_data, status=status.HTTP_200_OK)

        serializer = serializers.UserProjectSerializer2(models.UserProject.objects.all(), many=True)
        cache.set('ext-users-projects', serializer.data, 60 * 15)

        return Response(serializer.data, status=status.HTTP_200_OK)
