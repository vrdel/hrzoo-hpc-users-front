from backend import models
from backend.dbmodels.apikey import HRZOOHasAPIKey
from backend.serializers import ResourceUsageListSerializer, \
    ResourceUsageSerializer, AccountingUserProjectSerializer
from django.conf import settings
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiExample, \
    OpenApiParameter
from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class AccountingUserProjectAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    serializer_class = AccountingUserProjectSerializer(many=True)

    def _replace_projectsapi_fields(self, projid):
        for field in settings.PROJECT_IDENTIFIER_MAP:
            if field['from'] in projid:
                return projid.replace(field['from'], field['to'])
        return projid

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="tags",
                description="Tags",
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
        ]
    )
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
                        query |= Q(
                            staff_resources_type__contains=[{
                                "label": tag, "value": tag
                            }]
                        )
                    elif op == 'AND':
                        target_resources.append({
                            "label": tag,
                            "value": tag
                        })

                else:
                    query |= Q(
                        staff_resources_type__contains=[{
                            "label": tag, "value": tag
                        }]
                    )

            if target_resources:
                db_interested = models.Project.objects.filter(
                    staff_resources_type__exact=target_resources
                ).distinct()
            else:
                db_interested = models.Project.objects.filter(query).distinct()
                db_interested = db_interested.filter(
                    state__name__in=['approve', 'expire', 'extend']
                )

        elif tag:
            db_interested = models.Project.objects.filter(
                staff_resources_type__exact=[{"label": tag, "value": tag}]
            )
            db_interested = db_interested.filter(
                state__name__in=['approve', 'expire', 'extend']
            )

        else:
            db_interested = models.Project.objects.all().filter(
                state__name__in=['approve', 'expire', 'extend']
            )

        serializer = AccountingUserProjectSerializer(db_interested, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


class ResourceUsageAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)

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
