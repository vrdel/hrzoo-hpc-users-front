import base64

import requests
import rest_framework.authentication
from backend import models
from backend import serializers as backend_serializers
from backend.dbmodels.apikey import HRZOOHasAPIKey, MerlinHasAPIKey
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class ProjectsAPI(APIView):
    permission_classes = (HRZOOHasAPIKey,)
    authentication_classes = [rest_framework.authentication.TokenAuthentication]
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

                response = requests.get(
                    settings.DASHBOARD_API_INSTITUTIONS,
                    headers={"Authorization": f"Basic {token.decode('ascii')}"}
                )

                institutions = response.json()

                try:
                    project = serializer.save(
                        dashboard_institutions=institutions
                    )

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
