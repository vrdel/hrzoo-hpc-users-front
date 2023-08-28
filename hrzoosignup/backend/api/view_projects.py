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
