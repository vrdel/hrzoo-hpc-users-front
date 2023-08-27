import datetime

from backend import models
from backend import serializers
from backend.models import SSHPublicKey

from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class IsSessionActive(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        userdetails = dict()

        if isinstance(self.request.user, AnonymousUser) and \
                self.request.auth is None:
            return Response(
                {
                    "active": False,
                    "error": "Session not active"
                },
                status=status.HTTP_200_OK
            )
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)

            return Response(
                {
                    'active': True,
                    'userdetails': userdetails,
                    'csrftoken': get_token(request)
                },
                status=status.HTTP_200_OK)


def get_todays_datetime():
    return datetime.datetime.now()


def filter_active_projects(projects):
    return [
        project for project in projects if
        project.state.name == "approve" and (
            project.date_end > get_todays_datetime() or (
                len(models.DateExtend.objects.filter(project=project)) > 0 and (
                    project.date_end + relativedelta(months=+6)
                ) > get_todays_datetime()
            )
        )
    ]


class SshKeysAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        serializer = serializers.SshKeysSerializer2(SSHPublicKey.objects.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
            active_projects = filter_active_projects([
                proj.project for proj in
                models.UserProject.objects.filter(user=user).order_by(
                    "-date_joined"
                )
            ])
            resources = set()
            for p in active_projects:
                if p.staff_resources_type:
                    resources.update(
                        [t["value"] for t in p.staff_resources_type]
                    )

            if len(active_projects) > 0:
                resp_users.append({
                    "id": user.id,
                    "email": user.person_mail,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "ssh_keys": user_ssh_keys,
                    "last_project": {
                        "id": active_projects[0].id,
                        "identifier": active_projects[0].identifier
                    },
                    "resources": sorted(list(resources))
                })

        return Response(resp_users)


class ProjectsAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        projects = filter_active_projects(models.Project.objects.all())

        resp_projects = list()
        for project in projects:
            members = models.UserProject.objects.filter(project=project)
            resp_projects.append({
                "id": project.id,
                "identifier": project.identifier,
                "members": sorted([
                    {"id": member.user.id, "email": member.user.person_mail}
                    for member in members
                ], key=lambda k: k["email"])
            })

        return Response(resp_projects)
