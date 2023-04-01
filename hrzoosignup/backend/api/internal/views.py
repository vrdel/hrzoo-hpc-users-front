from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from django.core.cache import cache


class CroRISInfo(APIView):
    def get(self, request):

        print(request.user)
        oib = cache.get('hzsi@srce.hr_oib')

        return Response({'data': 'foobar', 'oib': cache.get('hzsi@srce.hr_oib')})
