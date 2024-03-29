from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth import get_user_model
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
            cache.set('science-software-get', serializer.data, None)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            err_response = {
                'status': {
                    'code': status.HTTP_401_UNAUTHORIZED,
                    'message': '{} - Not allowed to view the ops users'.format(request.user.username)
                }
            }
            return Response(err_response, status=status.HTTP_401_UNAUTHORIZED)

    def post(self, request, **kwargs):
        if request.user.is_staff or request.user.is_superuser:
            request.data['name'] = request.data['newAppModuleName']
            request.data['created'] = timezone.now()

            target_user = get_user_model().objects.get(username=request.data['username'])

            request.data['added_by'] = {
                    'username': target_user.username,
                    'first_name': target_user.first_name,
                    'last_name': target_user.last_name
                }

            serializer = ScienceSoftwareSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                cache.delete('science-software-get')
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:
            err_response = {
                'status': {
                    'code': status.HTTP_401_UNAUTHORIZED,
                    'message': '{} - Not allowed to change science software'.format(request.user.username)
                }
            }
            return Response(err_response, status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, id):
        if request.user.is_staff or request.user.is_superuser:
            try:
                software = models.ScienceSoftware.objects.get(id=id)
                software.delete()
                cache.delete('science-software-get')
                return Response(status=status.HTTP_204_NO_CONTENT)

            except models.ScienceSoftware.DoesNotExist as exc:
                err_response = {
                    'status': {
                        'code': status.HTTP_404_NOT_FOUND,
                        'message': '{} - Software not found'.format(request.user.username)
                    }
                }
                logger.error(err_response)
                return Response(err_response, status=status.HTTP_404_NOT_FOUND)

        else:
            err_response = {
                'status': {
                    'code': status.HTTP_401_UNAUTHORIZED,
                    'message': '{} - Not allowed to view the science software'.format(request.user.username)
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_401_UNAUTHORIZED)

