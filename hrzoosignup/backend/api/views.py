import datetime

from backend import models
from backend import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class IsSessionActive(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        userdetails = dict()

        if (isinstance(self.request.user, AnonymousUser)
            and self.request.auth is None):
            return Response(
                {"active": False, "error": "Session not active" },
                status=status.HTTP_200_OK)
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            return Response(
                {'active': True, 'userdetails': userdetails},
                status=status.HTTP_200_OK)


class UsersAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        users = models.User.objects.all()

        resp_users = list()
        for user in users:
            ssh_keys = models.SSHPublicKey.objects.filter(user=user)
            user_ssh_keys = sorted(
                [
                    {"name": key.name, "public_key": key.public_key}
                    for key in ssh_keys
                ], key=lambda k: k["name"]
            )
            projects = models.UserProject.objects.filter(user=user).order_by(
                "-date_joined"
            )
            user_projects = [
                {
                    "project_id": project.project.id,
                    "project_sifra": project.project.identifier,
                    "resources": sorted(
                        [r["value"] for r in
                         project.project.staff_resources_type if r] if
                        project.project.staff_resources_type else []
                    ),
                    "date_joined": datetime.datetime.strftime(
                        project.date_joined, "%Y-%m-%dT%H:%M:%S"
                    )
                } for project in projects if project.project.state.name in [
                    "approve", "extend"
                ]
            ]
            if len(user_projects) > 0:
                resp_users.append({
                    "id": user.id,
                    "user_email": user.person_mail,
                    "user_first_name": user.first_name,
                    "user_last_name": user.last_name,
                    "user_ssh_keys": user_ssh_keys,
                    "user_projects": user_projects
                })

        return Response(resp_users)
