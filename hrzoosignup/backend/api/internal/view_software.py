from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from backend.serializers import ScienceSoftwareSerializer
from backend import models


class ScienceSoftware(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        softwares = models.ScienceSoftware.objects.all()
        serializer = ScienceSoftwareSerializer(softwares, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
