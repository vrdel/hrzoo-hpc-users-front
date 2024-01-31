from backend import serializers
from backend import models

from django.db.models import Q
from django.conf import settings

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey


class AccountingUserProjectAPI(APIView):
    permission_classes = (HasAPIKey,)

    def _replace_projectsapi_fields(self, projid):
        for field in settings.PROJECT_IDENTIFIER_MAP:
            if field['from'] in projid:
                return projid.replace(field['from'], field['to'])
        return projid

    def _generate_response(self, projects):
        ret_data = []
        for project in projects:
            fields_project = dict()
            fields_project['id'] = project.id
            fields_project['sifra'] = self._replace_projectsapi_fields(project.identifier)
            fields_project['type'] = project.project_type.name
            fields_project['name'] = project.name
            fields_project['ustanova'] = project.institute
            fields_project['finance'] = project.croris_finance if project.croris_finance else []
            fields_project['approved_resources'] = [res['value'] for res in project.staff_resources_type]
            fields_project['users'] = list()

            for user in project.users.all():
                project_user = dict()
                project_user['id'] = user.id
                project_user['uid'] = user.person_uniqueid
                project_user['ime'] = user.first_name
                project_user['prezime'] = user.last_name
                project_user['mail'] = user.person_mail
                project_user['ustanova'] = user.person_institution
                fields_project['users'].append(project_user)

            ret_data.append(fields_project)

        return ret_data

    def get(self, request):
        tags = self.request.query_params.get('tags')
        query = Q()
        db_interested = list()

        if tags:
            tags = tags.split(',')

            if len(tags) == 1:
                db_interested = models.Project.objects.filter(staff_resources_type__exact=[{"label": tags[0], "value": tags[0]}])
                return Response(self._generate_response(db_interested), status=status.HTTP_200_OK)

            for tag in tags:
                query |= Q(staff_resources_type__contains=[{"label": tag, "value": tag}])

            db_interested = models.Project.objects.filter(query).distinct()
            return Response(self._generate_response(db_interested), status=status.HTTP_200_OK)

        else:
            projects = models.Project.objects.all().filter(state__name__in=['approve', 'expire', 'extend'])

            return Response(self._generate_response(projects), status=status.HTTP_200_OK)
