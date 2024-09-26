import json

from backend import models
from backend.utils.usage_data_preparation import Usage
from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey
from django.conf import settings


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
            try:
                ustanova = models.CrorisInstitutions.objects.get(
                    name_short=project.institute
                )
                fields_project['ustanova'] = {
                    "naziv": ustanova.name_short,
                    "oib": ustanova.oib,
                    "mbu": ustanova.mbu
                }

            except models.CrorisInstitutions.DoesNotExist:
                fields_project['ustanova'] = {
                    "naziv": project.institute,
                    "oib": "",
                    "mbu": ""
                }

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

        if resource not in settings.ALLOWED_RESOURCES:
            status_code = status.HTTP_400_BAD_REQUEST
            return Response(
                {
                    "status": {
                        "code": status_code,
                        "message": "Nonexisting resource"
                    }
                },
                status=status_code
            )

        else:
            data = request.data["usage"]

            error_message = ""
            status_code = status.HTTP_201_CREATED

            usage = Usage(data=data)

            df = usage.create_dataframe()

            model_instances = [
                models.ResourceUsage(
                    user=usage.users[record["user"]],
                    project=usage.projects[record["project"]] if
                    record["project"] else models.UserProject.objects.filter(
                        user=usage.users[record["user"]],
                    ).order_by("-date_joined")[0].project,
                    end_time=record["end_time"],
                    resource_name=resource,
                    accounting_record=json.loads(record["job_data"])
                ) for record in df.to_dict("records")
            ]

            models.ResourceUsage.objects.bulk_create(model_instances)

            if len(usage.missing_projects) > 0:
                status_code = status.HTTP_404_NOT_FOUND
                if len(usage.missing_projects) > 1:
                    noun = "projects"

                else:
                    noun = "project"

                if not error_message:
                    noun = noun.capitalize()

                error_message = (
                    f"{error_message}; {noun} "
                    f"{', '.join(sorted(list(usage.missing_projects)))} not "
                    f"found".strip("; ")
                )

            if len(usage.missing_users) > 0:
                status_code = status.HTTP_404_NOT_FOUND
                if len(usage.missing_users) > 1:
                    noun = "users"
                else:
                    noun = "user"

                if not error_message:
                    noun = noun.capitalize()

                error_message = (
                    f"{error_message}; {noun} "
                    f"{', '.join(sorted(list(usage.missing_users)))} not "
                    f"found".strip("; ")
                )

            if status_code != status.HTTP_201_CREATED:
                return Response(
                    {
                        "status": {
                            "code": status_code,
                            "message": error_message
                        }
                    },
                    status=status_code
                )

            else:
                return Response(status=status.HTTP_201_CREATED)

    def get(self, request):
        resource = request.query_params.get("resource")

        data = models.ResourceUsage.objects.filter(resource_name=resource)
        jobids = sorted(
            list(set(data.values_list("accounting_record__jobid", flat=True)))
        )

        return Response(jobids)
