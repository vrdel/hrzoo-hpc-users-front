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
        tags = self.request.query_params.get('tags')

        if tags:
            ret_data = cache.get('ext-users-projects')

            if ret_data:
                return Response(ret_data, status=status.HTTP_200_OK)

            for tag in tags:
            serializer = \
                serializers.UserProjectSerializer2(models.UserProject.objects.filter(
                    project__staff_resources_type__contains=[{"label": tags, "value": tags}]), many=True
                )
            import ipdb; ipdb.set_trace()
            cache.set('ext-users-projects', serializer.data, 60 * 15)

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            ret_data = cache.get('ext-users-projects')
            if ret_data:
                return Response(ret_data, status=status.HTTP_200_OK)

            serializer = serializers.UserProjectSerializer2(models.UserProject.objects.all(), many=True)
            cache.set('ext-users-projects', serializer.data, 60 * 15)

            return Response(serializer.data, status=status.HTTP_200_OK)
