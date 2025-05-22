from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.core.cache import cache
from django.utils import timezone

from backend import models
from backend.serializers_internal import ProjectExtendSerializer

import logging

logger = logging.getLogger('hrzoosignup.views')


class ProjectExtend(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, )

    def post(self, request, **kwargs):
        projid = kwargs.get('projid')

        try:
            up_obj = models.UserProject.objects.get(project__identifier=projid, user=request.user, role__name='lead')

            if up_obj.project.state.name != 'approve-expire':
                msg = {
                    'status': {
                        'code': status.HTTP_400_BAD_REQUEST,
                        'message': '{} - Project is not in approve-expire state'.format(request.user.username)
                    }
                }
                logger.error(msg)
                return Response(msg, status=status.HTTP_400_BAD_REQUEST)

            # TODO: validate new date_end
            request.data['project'] = up_obj.project.pk
            request.data['date'] = timezone.now()
            request.data['approved'] = False
            serializer = ProjectExtendSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()

                state_extend = models.State.objects.get(name='submit-extend')
                p_obj = up_obj.project
                p_obj.state = state_extend
                p_obj.save()
                cache.delete("ext-users-projects")
                cache.delete('projects-get-all')

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except models.UserProject.DoesNotExist:
            err_response = {
                'status': {
                    'code': status.HTTP_404_NOT_FOUND,
                    'message': '{} - UserProject not found'.format(request.user.username)
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, **kwargs):
        projid = kwargs.get('projid', None)

        if projid:
            ups_obj = models.UserProject.objects.filter(user=request.user, role__name='lead', project__identifier=projid)
            interested_projects = ups_obj.values_list('project', flat=True)
            pes_obj = models.ProjectExtend.objects.filter(project__in=interested_projects)
            if pes_obj:
                serializer = ProjectExtendSerializer(pes_obj, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            ups_obj = models.UserProject.objects.filter(user=request.user, role__name='lead')
            interested_projects = ups_obj.values_list('project', flat=True)
            pes_obj = models.ProjectExtend.objects.filter(project__in=interested_projects)
            if pes_obj:
                serializer = ProjectExtendSerializer(pes_obj, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(list(), status=status.HTTP_200_OK)
