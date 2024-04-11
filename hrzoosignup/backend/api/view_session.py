from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from backend import serializers

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token


class IsSessionActive(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        userdetails = dict()

        if isinstance(self.request.user, AnonymousUser) and \
                self.request.auth is None:
            return Response(
                {
                    "active": False,
                    "error": "Session not active",
                    'config': {
                        'enable_edugain': settings.SAML_EDUGAINENABLE
                    }
                },
                status=status.HTTP_200_OK
            )
        else:
            user = get_user_model().objects.get(id=self.request.user.id)
            serializer = serializers.UsersSerializer(user)
            userdetails.update(serializer.data)
            saml2_idp = request.session.get('saml2_idp')

            return Response(
                {
                    'active': True,
                    'userdetails': userdetails,
                    'csrftoken': get_token(request),
                    'saml2_idp': saml2_idp,
                    'config': {
                        'enable_edugain': settings.SAML_EDUGAINENABLE
                    }
                },
                status=status.HTTP_200_OK)
