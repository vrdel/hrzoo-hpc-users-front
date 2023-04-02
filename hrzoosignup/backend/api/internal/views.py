from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.conf import settings
from django.core.cache import cache

import asyncio
import uvloop
import aiohttp
import json
import datetime


from aiohttp import client_exceptions, http_exceptions, ClientSession


class CroRISInfo(APIView):
    def get(self, request):
        self.projects_lead, self.projects_lead_info = None, None

        oib = cache.get('hzsi@srce.hr_oib')

        self.loop = uvloop.new_event_loop()
        asyncio.set_event_loop(self.loop)

        client_timeout = aiohttp.ClientTimeout(total=180)
        self.session = ClientSession(timeout=client_timeout)
        self.auth = aiohttp.BasicAuth(settings.CRORIS_USER,
                                      settings.CRORIS_PASSWORD)

        if oib:
            self.loop.run_until_complete(self.fetch_lead(oib[0].strip()))
            self.loop.run_until_complete(self.fetch_projectinfo())
            self.loop.close()

        if self.projects_lead and self.projects_lead_info:
            return Response({
                'data': {
                    'projects_lead_info': self.projects_lead_info,
                    'projects_lead': self.projects_lead
                },
                'status': {
                    'code': status.HTTP_200_OK
                }
            })
        elif not oib:
            return Response({
                'status': {
                    'code': status.HTTP_204_NO_CONTENT,
                    'message': 'Could not get authentication info from cache'
                }
            })

    async def _fetch_data(self, url):
        headers = {'Accept': 'application/json'}
        async with self.session.get(url, headers=headers, auth=self.auth) as response:
            content = await response.text()
            if content:
                return content

    async def fetch_lead(self, oib):
        coros = [self._fetch_data(settings.API_PERSONLEAD.replace("{persOib}", oib))]
        self.projects_lead = await asyncio.gather(*coros, loop=self.loop, return_exceptions=True)
        self.projects_lead = json.loads(self.projects_lead[0])
        self.projects_lead = {
            'first_name': self.projects_lead['ime'],
            'last_name': self.projects_lead['prezime'],
            'croris_id': self.projects_lead['persId'],
            'lead_status': True,
            'project_links': self.projects_lead['_links'].get('projekt', None)
        }

    async def fetch_projectinfo(self):
        coros = []
        parsed_projects = []

        projects = self.projects_lead['project_links']
        if projects:
            for project in projects:
                coros.append(self._fetch_data(project['href']))

        self.projects_lead_info = await asyncio.gather(*coros, loop=self.loop, return_exceptions=True)
        for project in self.projects_lead_info:
            project = json.loads(project)
            metadata = {}
            metadata['start'] = project.get('pocetak', None)
            metadata['end'] = project.get('kraj', None)
            # projects may be outdated
            if metadata['end']:
                today = datetime.datetime.today()
                end_date = datetime.datetime.strptime(metadata['end'], '%d.%m.%Y')
                if end_date <= today:
                    continue
            metadata['identifier'] = project.get('hrSifraProjekta', None)
            titles = project['title']
            for title in titles:
                if title['cfLangCode'] == 'hr':
                    metadata['title'] = title['naziv']
                    break
            summaries = project['summary']
            for summary in summaries:
                if summary['cfLangCode'] == 'hr':
                    metadata['summary'] = summary.get('naziv', '')
                    break
            parsed_projects.append(metadata)

        self.projects_lead_info = parsed_projects
