import datetime

from dateutil.relativedelta import relativedelta

from backend import models

from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.response import Response


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
