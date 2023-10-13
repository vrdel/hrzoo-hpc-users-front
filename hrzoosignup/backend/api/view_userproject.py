from backend import serializers
from backend import models

from django.core.cache import cache
from django.db.models import Q

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class UserProjectAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        tags = self.request.query_params.get('tags')
        query = Q()

        if tags:
            tags = tags.split(',')
            cached_data = cache.get('ext-users-projects')
            cached_visited = set()
            cached_interested = list()

            if cached_data:
                for tag in tags:
                    for up in cached_data:
                        if (tag in up['project']['staff_resources_type']
                            and up['project']['identifier'] not in cached_visited):
                            cached_interested.append(up)
                            cached_visited.add(up['project']['identifier'])

            else:
                for tag in tags:
                    query |= Q(project__staff_resources_type__contains=[{"label": tag, "value": tag}])

            serializer = \
                serializers.UserProjectSerializer2(models.UserProject.objects.filter(query).distinct(), many=True)
            cache.set('ext-users-projects', serializer.data, 60 * 15)

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            ret_data = cache.get('ext-users-projects')
            if ret_data:
                return Response(ret_data, status=status.HTTP_200_OK)

            serializer = serializers.UserProjectSerializer2(models.UserProject.objects.all(), many=True)
            cache.set('ext-users-projects', serializer.data, 60 * 15)

            return Response(serializer.data, status=status.HTTP_200_OK)
