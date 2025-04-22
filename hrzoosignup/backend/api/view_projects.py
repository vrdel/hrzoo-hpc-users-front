from backend import models
from backend import serializers
from backend.dbmodels.apikey import SNRHasAPIKey
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class ProjectsAPI(APIView):
    permission_classes = (SNRHasAPIKey,)
    serializer_class = serializers.ProjectSerializerFiltered

    def get(self, request):
        projects = models.Project.objects.all()
        serializer = serializers.ProjectSerializerFiltered(projects, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
