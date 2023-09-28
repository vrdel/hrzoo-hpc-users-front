from backend import models
from backend import serializers

from rest_framework.views import APIView
from rest_framework import status
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.response import Response


class ProjectsAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        projects = models.Project.objects.all()
        serializer = serializers.ProjectSerializerFiltered(projects, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
