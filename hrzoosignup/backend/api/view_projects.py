import base64

import requests
from backend import models
from backend import serializers as backend_serializers
from backend.dbmodels.apikey import HRZOOHasAPIKey, MerlinHasAPIKey
from django.conf import settings
from django.core.cache import cache
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class ProjectsAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    serializer_class = backend_serializers.ProjectSerializerFiltered

    def get(self, request):
        projects = models.Project.objects.all()
        serializer = backend_serializers.ProjectSerializerFiltered(
            projects, many=True
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class NewProjectsAPI(APIView):
    permission_classes = (MerlinHasAPIKey,)
    serializer_class = backend_serializers.NewProjectsSerializer

    @extend_schema(
        responses={
            201: OpenApiResponse(
                response={
                    "status": {
                        "code": 201,
                        "project_id": 1,
                        "message": "Project successfully created"
                    }
                },
                description="Created",
                examples=[
                    OpenApiExample(
                        "Created",
                        value={
                            "status": {
                                "code": 201,
                                "project_id": 1,
                                "message": "Project successfully created"
                            }
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                response={
                    "status": {
                        "code": 400,
                        "message":
                            "project_type: TEST is not valid project type"
                    }
                },
                description="Bad request",
                examples=[
                    OpenApiExample(
                        "Bad request",
                        value={
                            "status": {
                                "code": 400,
                                "message": "project_type: TEST is not valid "
                                           "project type"
                            }
                        }
                    ),
                    OpenApiExample(
                        "Bad request",
                        value={
                            "status": {
                                "code": 400,
                                "message": "resources_type: TEST is not among "
                                           "allowed resources"
                            }
                        }
                    )
                ]
            ),
            403: OpenApiResponse(
                response={
                    "detail": "Authentication credentials were not provided."
                },
                description="Forbidden",
                examples=[
                    OpenApiExample(
                        "Forbidden",
                        value={
                            "detail":
                                "Authentication credentials were not provided."
                        }
                    )
                ]
            )
        }
    )
    def post(self, request):
        serializer = backend_serializers.NewProjectsSerializer(
            data=request.data
        )

        try:
            if serializer.is_valid(raise_exception=True):
                token = base64.b64encode(
                    f"{settings.DASHBOARD_USERNAME}:"
                    f"{settings.DASHBOARD_PASS}".encode("ascii")
                )

                try:
                    response = requests.get(
                        settings.DASHBOARD_API_INSTITUTIONS,
                        headers={
                            "Authorization": f"Basic {token.decode('ascii')}"
                        }
                    )

                    response.raise_for_status()

                    institutions = response.json()

                except requests.exceptions.RequestException as e:
                    status_code = response.status_code
                    error_msg = f"Error fetching institutions"

                    if str(e):
                        error_msg = f"{error_msg}: {str(e)}"

                    return Response(
                        status=status_code,
                        data={
                            "status": {
                                "code": status_code,
                                "message": error_msg
                            }
                        }
                    )

                try:
                    project = serializer.save(
                        dashboard_institutions=institutions
                    )
                    cache.delete('projects-get-all')
                    cache.delete("ext-users-projects")

                except IndexError:
                    status_code = status.HTTP_404_NOT_FOUND
                    return Response(
                        status=status_code,
                        data={
                            "status": {
                                "code": status_code,
                                "message":
                                    f"Institution with "
                                    f"id={request.data['institute']} not found"
                            }
                        }
                    )

                else:
                    return Response(
                        data={
                            "status": {
                                "code": status.HTTP_201_CREATED,
                                "project_id": project.id,
                                "message": "Project successfully created"
                            }
                        },
                        status=status.HTTP_201_CREATED
                    )

            else:
                return Response(
                    data=serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )

        except serializers.ValidationError:
            status_code = status.HTTP_400_BAD_REQUEST
            error_set = set()
            for key, value in serializer.errors.items():
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


class MerlinProjectsAPI(APIView):
    permission_classes = (MerlinHasAPIKey,)
    serializer_class = backend_serializers.MerlinProjectsSerializer

    @staticmethod
    def _generate_error_response_message(msg, code):
        return {
            "status": {
                "code": code,
                "message": msg
            }
        }

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response={
                    "id": 0,
                    "date_approved": "2024-05-03",
                    "date_start": "2024-05-01",
                    "date_end": "2025-12-31",
                    "date_submitted": "2024-05-03",
                    "identifier": "string",
                    "institute": "string",
                    "is_active": True,
                    "name": "string",
                    "project_type": "string",
                    "reason": "string",
                    "resources_type": ["string"],
                    "science_field": [
                        {
                            "name": "string",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    'name': 'string',
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "state": "string",
                    "users": [
                        {
                            "id": 0,
                            "username": "string",
                            "person_mail": "string",
                            "first_name": "string",
                            "last_name": "string",
                            "person_oib": "string",
                            "role": "string",
                            "person_uniqueid": "string",
                            "person_institution": "string"
                        }
                    ]
                },
                description="OK",
                examples=[
                    OpenApiExample(
                        "OK",
                        value={
                            "id": 0,
                            "date_approved": "2024-05-03",
                            "date_start": "2024-05-01",
                            "date_end": "2025-12-31",
                            "date_submitted": "2024-05-03",
                            "identifier": "string",
                            "institute": "string",
                            "is_active": True,
                            "name": "string",
                            "project_type": "string",
                            "reason": "",
                            "resources_type": ["string"],
                            "science_field": [
                                {
                                    "name": "string",
                                    "percent": 100,
                                    "scientificfields": [
                                        {
                                            'name': 'string',
                                            "percent": 100
                                        }
                                    ]
                                }
                            ],
                            "state": "string",
                            "users": [
                                {
                                    "id": 0,
                                    "username": "string",
                                    "person_mail": "string",
                                    "first_name": "string",
                                    "last_name": "string",
                                    "person_oib": "string",
                                    "role": "string",
                                    "person_uniqueid": "string",
                                    "person_institution": "string"
                                }
                            ]
                        }
                    )
                ]
            ),
            403: OpenApiResponse(
                response={
                    "detail": "Authentication credentials were not provided."
                },
                description="Forbidden",
                examples=[
                    OpenApiExample(
                        "Forbidden",
                        value={
                            "detail":
                                "Authentication credentials were not provided."
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                response={
                    "status": {
                        "code": status.HTTP_404_NOT_FOUND,
                        "message": "Project with id <proj_id> does not exist"
                    }
                },
                description="Not Found",
                examples=[
                    OpenApiExample(
                        "Not Found",
                        value={
                            "status": {
                                "code": status.HTTP_404_NOT_FOUND,
                                "message": "Project with id <proj_id> does not exist"
                            }
                        }
                    )
                ]
            )
        }
    )
    def get(self, request, proj_id):
        try:
            project = models.Project.objects.get(id=proj_id)
            serializer = backend_serializers.MerlinProjectsSerializer(
                project
            )

            data = serializer.data
            status_code = status.HTTP_200_OK

        except models.Project.DoesNotExist:
            status_code = status.HTTP_404_NOT_FOUND
            data = self._generate_error_response_message(
                msg = f"Project with id {proj_id} does not exist",
                code=status_code
            )

        return Response(data=data, status=status_code)


class ProjectsUsersAPI(APIView):
    permission_classes = (MerlinHasAPIKey,)

    def post(self):
        pass
