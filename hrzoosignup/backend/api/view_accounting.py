import ast
import json
import copy

from backend import models
from django.conf import settings
from django.db.models import Q
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

    def _set_realm_from_map(self, inst_name):
        for field in settings.MAP_REALMS:
            if field['from'] in inst_name:
                return inst_name.replace(field['from'], field['to'])
        return ''

    def _set_project_finance(self, project):
        if project.croris_finance:
            return project.croris_finance
        else:
            return [project.institute]

    def _flatten_field(self, field):
        reformat_sfs = list()

        for sf in field:
            rsf = dict()
            rsf['name'] = sf['name']['value']
            rsf['percent'] = sf['percent']
            rsf['scientificfields'] = list()
            for fl in sf['scientificfields']:
                rsf_s = dict()
                rsf_s['name'] = fl['name']['value']
                rsf_s['percent'] = fl['percent']
                rsf['scientificfields'].append(rsf_s)

            reformat_sfs.append(rsf)

        return reformat_sfs

    def _croris_url(self, croris_id):
        if croris_id:
            return f'https://www.croris.hr/projekti/projekt/{croris_id}'
        else:
            return ''

    def _generate_response(self, projects):
        ret_data = []
        for project in projects:
            try:
                realm_inst = models.CrorisInstitutions.objects.get(name_short=project.institute).realm
            except models.CrorisInstitutions.DoesNotExist:
                realm_inst = ''
            if not realm_inst:
                realm_inst = self._set_realm_from_map(project.institute)
            fields_project = dict()
            fields_project['id'] = project.id
            fields_project['sifra'] = self._replace_projectsapi_fields(project.identifier)
            fields_project['date_from'] = project.date_start
            fields_project['date_end'] = project.date_end
            fields_project['date_approved'] = project.date_approved.strftime('%Y-%m-%d')
            fields_project['type'] = project.project_type.name
            fields_project['name'] = project.name
            fields_project['ustanova'] = project.institute
            fields_project['croris_url'] = self._croris_url(project.croris_id)
            fields_project['science_field'] = self._flatten_field(project.science_field)
            fields_project['realm'] = realm_inst
            fields_project['finance'] = self._set_project_finance(project)
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
        tag = self.request.query_params.get('tag')
        op = self.request.query_params.get('op')
        query = Q()
        db_interested = list()

        if tags:
            tags = tags.split(',')
            target_resources = list()
            for tag in tags:
                if op:
                    if op == 'OR':
                        query |= Q(staff_resources_type__contains=[{"label": tag, "value": tag}])
                    elif op == 'AND':
                        target_resources.append({
                            "label": tag,
                            "value": tag
                        })
                else:
                    query |= Q(staff_resources_type__contains=[{"label": tag, "value": tag}])

            if target_resources:
                db_interested = models.Project.objects.filter(staff_resources_type__exact=target_resources).distinct()
            else:
                db_interested = models.Project.objects.filter(query).distinct()
            db_interested = db_interested.filter(state__name__in=['approve', 'expire', 'extend'])
            return Response(self._generate_response(db_interested), status=status.HTTP_200_OK)

        elif tag:
            db_interested = models.Project.objects.filter(staff_resources_type__exact=[{"label": tag, "value": tag}])
            db_interested = db_interested.filter(state__name__in=['approve', 'expire', 'extend'])
            return Response(self._generate_response(db_interested), status=status.HTTP_200_OK)

        else:
            projects = models.Project.objects.all().filter(state__name__in=['approve', 'expire', 'extend'])
            return Response(self._generate_response(projects), status=status.HTTP_200_OK)


class ResourceUsageAPI(APIView):
    permission_classes = (HasAPIKey,)

    def post(self, request):
        resource = request.query_params.get("resource")

        data = request.data.getlist("usage")

        for entry in data:
            entry = ast.literal_eval(entry)
            user = models.User.objects.get(person_username=entry["user"])

            for job in entry["jobs"]:
                job_data = copy.deepcopy(job)
                job_data.pop("project")
                models.ResourceUsage.objects.create(
                    user=user,
                    project=models.Project.objects.get(
                        identifier=job["project"]
                    ),
                    resource_name=resource,
                    accounting_record=job_data
                )

        return Response(status=status.HTTP_201_CREATED)
