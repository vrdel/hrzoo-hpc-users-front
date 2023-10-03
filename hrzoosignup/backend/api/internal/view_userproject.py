from backend import serializers
from backend import models

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

import logging

logger = logging.getLogger('hrzoosignup.views')


class UsersProjects(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, **kwargs):
        try:
            userproject_obj = models.UserProject.objects.filter(
                user_id__in=request.data,
                project_id=kwargs['projiddb']
            )

            ami_lead = models.UserProject.objects.get(project_id=kwargs['projiddb'], user_id=self.request.user.id)
            if ami_lead.role.name != 'lead':
                err_status = status.HTTP_401_UNAUTHORIZED
                err_response = {
                    'status': {
                        'code': err_status,
                        'message': '{} - Not authorized to remove users from this project'.format(request.user.username)
                    }
                }
                logger.error(err_response)
                return Response(err_response, status=err_status)

            userproject_obj.delete()
            msg = {
                'status': {
                    'code': status.HTTP_200_OK,
                    'message': '{} - Users removed from project'.format(request.user.username)
                }
            }
            return Response(msg, status=status.HTTP_200_OK)

        except Exception as exc:
            msg = {
                'status': {
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': '{} - Removing users from project problem: {}'.format(request.user.username, repr(exc))
                }
            }
            logger.error(msg)
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
