from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from backend.serializers import ScienceSoftwareSerializer
from backend import models

import logging


logger = logging.getLogger('hrzoosignup.views')


class ScienceSoftware(APIView):
    authentication_classes = (SessionAuthentication,)
    # permission_classes = (AllowAny,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        if request.user.is_staff or request.user.is_superuser:
            ret_data = cache.get('science-software-get')
            if ret_data:
                return Response(ret_data)

            softwares = models.ScienceSoftware.objects.all()
            serializer = ScienceSoftwareSerializer(softwares, many=True)
            sort_softwares = sorted(serializer.data, key=lambda e: e['name'])
            cache.set('science-software-get', sort_softwares, 60 * 15)
            return Response(sort_softwares, status=status.HTTP_200_OK)

        else:
            err_response = {
                'status': {
                    'code': status.HTTP_401_UNAUTHORIZED,
                    'message': '{} - Not allowed to view the ops users'.format(request.user.username)
                }
            }
            return Response(err_response, status=status.HTTP_401_UNAUTHORIZED)

