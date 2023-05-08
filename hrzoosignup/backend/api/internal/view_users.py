from backend import models
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class UsersInfo(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
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
                    "projects": [{
                        "identifier": userproject.project.identifier,
                        "state": userproject.project.state.name,
                        "role": userproject.role.name,
                        "type": userproject.project.project_type.name
                    } for userproject in projects],
                    "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
                })

        return Response(sorted(resp_users, key=lambda k: k["username"]))
