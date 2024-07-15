from backend import models
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ResourceUsage(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        records = models.ResourceUsage.objects.filter(
            user=models.User.objects.get(person_username=user)
        )

        output = list()

        for record in records:
            tmp_dict = record.accounting_record
            tmp_dict.update({
                "user": user.person_username,
                "project": record.project.identifier,
                "resource_name": record.resource_name
            })
            output.append(tmp_dict)

        return Response(data=output, status=status.HTTP_200_OK)
