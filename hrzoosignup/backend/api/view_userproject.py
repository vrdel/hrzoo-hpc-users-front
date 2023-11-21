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
        projects = self.request.query_params.get('projects')
        query = Q()
        cached_interested, db_interested = list(), list()

        if tags:
            tags = tags.split(',')
            cached_data = cache.get('ext-users-projects')

            if cached_data:
                for tag in tags:
                    for up in cached_data:
                        if (tag in up['project']['staff_resources_type']):
                            cached_interested.append(up)
            else:
                for tag in tags:
                    query |= Q(project__staff_resources_type__contains=[{"label": tag, "value": tag}])
                db_interested = models.UserProject.objects.filter(query).distinct()

            if cached_interested:
                return Response(cached_interested, status=status.HTTP_200_OK)
            else:
                serializer = \
                    serializers.UserProjectSerializer2(db_interested, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

        elif projects:
            projects = projects.split(',')
            cached_data = cache.get('ext-users-projects')

            if cached_data:
                for project in projects:
                    for up in cached_data:
                        if project in up['project']['identifier']:
                            cached_interested.append(up)
            else:
                for project in projects:
                    query |= Q(project__identifier=project)
                db_interested = models.UserProject.objects.filter(query).distinct()

            if cached_interested:
                return Response(cached_interested, status=status.HTTP_200_OK)
            else:
                serializer = \
                    serializers.UserProjectSerializer2(db_interested, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            ret_data = cache.get('ext-users-projects')
            if ret_data:
                return Response(ret_data, status=status.HTTP_200_OK)

            serializer = serializers.UserProjectSerializer2(models.UserProject.objects.all(), many=True)
            cache.set('ext-users-projects', serializer.data, 60 * 15)

            return Response(serializer.data, status=status.HTTP_200_OK)
