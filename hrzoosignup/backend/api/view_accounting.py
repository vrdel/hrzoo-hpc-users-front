from backend import models
from backend.serializers import ResourceUsageListSerializer, \
    ResourceUsageSerializer
from django.conf import settings
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiExample, \
    OpenApiParameter
from rest_framework import serializers
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
            try:
                return [
                    models.CrorisInstitutions.objects.get(
                        name_short=project.institute
                    ).name_long
                ]

            except models.CrorisInstitutions.DoesNotExist:
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
                if not ustanova.name_long:
                    name_long = project.institute
                else:
                    name_long = ustanova.name_long

                fields_project['ustanova'] = {
                    "naziv": name_long,
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
                try:
                    person_institution = models.CrorisInstitutions.objects.get(
                        name_short=user.person_institution
                    )
                    if person_institution.name_long:
                        person_institution = person_institution.name_long

                    else:
                        person_institution = user.person_institution

                except models.CrorisInstitutions.DoesNotExist:
                    person_institution = user.person_institution

                project_user = dict()
                project_user['id'] = user.id
                project_user['uid'] = user.person_uniqueid
                project_user['ime'] = user.first_name
                project_user['prezime'] = user.last_name
                project_user['mail'] = user.person_mail
                project_user['ustanova'] = person_institution
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

    @extend_schema(
        description="POST information on data usage",
        parameters=[
            OpenApiParameter(
                name="resource",
                description="Resource name",
                required=True,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name="token",
                description="Authorization token",
                required=True,
                type=str,
                location=OpenApiParameter.HEADER
            )
        ],
        responses=ResourceUsageSerializer,
        examples=[
            OpenApiExample(
                "Sending data from Supek/Padobran",
                value={
                    "usage": [
                        {
                            "user": "adent",
                            "jobid": "12345",
                            "walltime": "3920",
                            "ncpus": "4",
                            "project": "project-1",
                            "start_time": "1717845508",
                            "end_time": "1717849428",
                            "queue": "gpu",
                            "wait_time": "2",
                            "qtime": "1717796832",
                            "ngpus": "2"
                        },
                        {
                            "user": "adent",
                            "jobid": "12346",
                            "walltime": "10",
                            "ncpus": "18",
                            "project": "project-1",
                            "start_time": "1716001512",
                            "end_time": "1716001522",
                            "queue": "queue1",
                            "wait_time": "2",
                            "qtime": ""
                        }
                    ]
                }
            ),
            OpenApiExample(
                "Sending data from Vrancic",
                value={
                    "usage": [
                        {
                            "project": "project-3",
                            "end_time": "1727906399",
                            "start_time": "1727733601",
                            "instance_id": "1212121212",
                            "vcpus": "16",
                            "started_at": "1725015063",
                            "ended_at": None,
                            "ngpus": "1",
                            "flavor": "m1.gpu.1"
                        },
                        {
                            "project": "project-4",
                            "end_time": "1727906399",
                            "start_time": "1727733601",
                            "instance_id": "d591480f",
                            "vcpus": "4",
                            "started_at": "1727782030",
                            "ended_at": None,
                            "flavor": "m1.half.windows"
                        },
                        {
                            "project": "project-5",
                            "end_time": "1727906399",
                            "start_time": "1727733601",
                            "instance_id": "13241243135132",
                            "vcpus": "64",
                            "started_at": "1719313795",
                            "ended_at": "1727761972",
                            "flavor": "m1.medium"
                        }
                    ]
                }
            ),
            OpenApiExample(
                "Sending data from Jupyter",
                value={
                    "usage": [
                        {
                            "user": "user119@fer.hr",
                            "jupyter_cpu_h": 17.17,
                            "jupyter_gpu_h": 0,
                            "end_time": "1727906399"
                        },
                        {
                            "user": "user454@fer.hr",
                            "jupyter_cpu_h": 0.73,
                            "jupyter_gpu_h": 0.18,
                            "end_time": "1727906399"
                        }
                    ]
                }
            )
        ]
    )
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
            error_message = ""
            status_code = status.HTTP_201_CREATED

            serializer = ResourceUsageSerializer(data=request.data)

            try:
                serializer.is_valid(raise_exception=True)
                usage = serializer.save(resource=resource)

            except serializers.ValidationError:
                status_code = status.HTTP_400_BAD_REQUEST
                error_set = set()
                for item in serializer.errors["usage"]:
                    for key, value in item.items():
                        error_set.add(f"{key}: {str(value[0])}")
                return Response(
                    {
                        "status": {
                            "code": status_code,
                            "message": " ".join(error_set)
                        }
                    },
                    status=status_code
                )

            else:
                if usage:
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
                            f"{', '.join(sorted(list(usage.missing_projects)))}"
                            f" not found".strip("; ")
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
                            f"{', '.join(sorted(list(usage.missing_users)))} "
                            f"not found".strip("; ")
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

                else:
                    return Response(status=status.HTTP_200_OK)

    @extend_schema(
        description="List job IDs for given resource",
        parameters=[
            OpenApiParameter(
                name="resource",
                description="Resource name",
                required=True,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name="token",
                description="Authorization token",
                required=True,
                type=str,
                location=OpenApiParameter.HEADER
            )
        ],
        responses=ResourceUsageListSerializer,
        examples=[
            OpenApiExample(
                "List of job IDs",
                value=["1234", "5678", "9102"]
            )
        ]
    )
    def get(self, request):
        resource = request.query_params.get("resource")
        serializer = ResourceUsageListSerializer

        return Response(serializer.list_jobids(resource=resource))
