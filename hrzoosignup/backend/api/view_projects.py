from backend import models

from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.response import Response


class ProjectsAPI(APIView):
    permission_classes = (HasAPIKey,)

    def get(self, request):
        projects = models.Project.objects.all()

        resp_projects = list()
        for project in projects:
            members = models.UserProject.objects.filter(project=project)
            resp_projects.append({
                "id": project.id,
                "identifier": project.identifier,
                "members": sorted([
                    {"id": member.user.id, "username": member.user.username}
                    for member in members
                ], key=lambda k: k["email"])
            })

        return Response(resp_projects)
