import rest_framework.authentication
from backend import models
from backend import serializers as backend_serializers
from backend.dbmodels.apikey import HRZOOHasAPIKey, MerlinHasAPIKey
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
                response=None,
                description="Created"
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
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)

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
