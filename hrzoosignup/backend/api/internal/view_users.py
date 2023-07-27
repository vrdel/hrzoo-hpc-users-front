from backend import models
from backend import serializers
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class UsersInfoOps(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            ret_data = cache.get('usersinfo-ops-get')
            if ret_data:
                return Response(ret_data)

            users = get_user_model().objects.filter(is_staff=True)

            serializer = serializers.UsersSerializer(users, many=True)
            cache.set('usersinfo-ops-get', serializer.data, 60 * 15)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            err_response = {
                'status': {
                    'code': status.HTTP_401_UNAUTHORIZED,
                    'message': '{} - Not allowed to view the ops users'.format(request.user.username)
                }
            }
            return Response(err_response, status=status.HTTP_404_NOT_FOUND)


class UsersInfo(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        ret_data = cache.get('usersinfo-get')
        if ret_data:
            return Response(ret_data)

        users = models.User.objects.all()
        lead = models.Role.objects.get(name="lead")
        collaborator = models.Role.objects.get(name="collaborator")

        resp_users = list()
        for user in users:
            userprojects = models.UserProject.objects.filter(user=user)
            active_userprojects = [
                p for p in userprojects if p.project.state.name == "approve"
            ]
            projects_lead = sorted(
                [up for up in active_userprojects if up.role == lead],
                key=lambda k: k.project.identifier
            )
            projects_collab = sorted(
                [up for up in active_userprojects if up.role == collaborator],
                key=lambda k: k.project.identifier
            )
            projects = projects_lead + projects_collab
            if len(projects) > 0:
                resp_users.append({
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "person_institution": user.person_institution,
                    "person_mail": user.person_mail,
                    "ssh_key":
                        len(models.SSHPublicKey.objects.filter(user=user)) > 0,
                    "projects": [{
                        "identifier": userproject.project.identifier,
                        "state": userproject.project.state.name,
                        "role": userproject.role.name,
                        "type": userproject.project.project_type.name
                    } for userproject in projects],
                    "date_joined":
                        user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
                })

            ret_data = sorted(resp_users, key=lambda k: k["first_name"])
            cache.set('usersinfo-get', ret_data, 60 * 15)

        return Response(ret_data)
