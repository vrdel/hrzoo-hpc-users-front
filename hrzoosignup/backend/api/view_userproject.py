from backend import models
from backend import serializers
from backend.dbmodels.apikey import HRZOOHasAPIKey
from backend.caching import entries, store
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

import datetime


class UserProjectAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    serializer_class = serializers.UserProjectSerializer

    def get(self, request):
        tags = self.request.query_params.get('tags')
        projects = self.request.query_params.get('projects')
        query = Q()
        cached_interested, db_interested = list(), list()

        if tags:
            tags = tags.split(',')
            cached_data = store.get(entries.EXTERNAL_MEMBERSHIPS)

            if cached_data is not None:
                for tag in tags:
                    for up in cached_data:
                        if (tag in up['project']['staff_resources_type']):
                            cached_interested.append(up)
            else:
                for tag in tags:
                    query |= Q(project__staff_resources_type__contains=[{"label": tag, "value": tag}])
                db_interested = models.UserProject.objects.filter(query).distinct()
                query = Q(project__is_active=True, project__date_start__lte=datetime.datetime.now().date()) | Q(project__is_active=True, project__project_type__name='srce-workshop')
                db_interested = db_interested.filter(query)

            if cached_interested:
                return Response(cached_interested, status=status.HTTP_200_OK)
            else:
                serializer = \
                    serializers.UserProjectSerializer(db_interested, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

        elif projects:
            projects = projects.split(',')

            for project in projects:
                query |= Q(project__identifier=project)
            db_interested = models.UserProject.objects.filter(query).distinct()
            db_interested = db_interested.filter(project__is_active=True)

            serializer = \
                serializers.UserProjectSerializer(db_interested, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            ret_data = store.get(entries.EXTERNAL_MEMBERSHIPS)
            if ret_data is not None:
                return Response(ret_data, status=status.HTTP_200_OK)

            query = Q(project__is_active=True, project__date_start__lte=datetime.datetime.now().date()) | Q(project__is_active=True, project__project_type__name='srce-workshop')
            db_interested = models.UserProject.objects.filter(query)

            serializer = serializers.UserProjectSerializer(db_interested, many=True)
            store.set(entries.EXTERNAL_MEMBERSHIPS, serializer.data)

            return Response(serializer.data, status=status.HTTP_200_OK)
