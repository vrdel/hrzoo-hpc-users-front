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
        self.person_info, self.projects_lead_info = None, None
        self.dead_projects = []

        oib = cache.get('hzsi@srce.hr_oib')

        self.loop = uvloop.new_event_loop()
        asyncio.set_event_loop(self.loop)

        client_timeout = aiohttp.ClientTimeout(total=180)
        self.session = ClientSession(timeout=client_timeout)
        self.auth = aiohttp.BasicAuth(settings.CRORIS_USER,
                                      settings.CRORIS_PASSWORD)

        if oib:
            self.loop.run_until_complete(self.fetch_person_lead(oib[0].strip()))
            self.loop.run_until_complete(self.fetch_project_info())
            self.loop.close()

        if self.person_info and self.projects_lead_info:
            return Response({
                'data': {
                    'projects_lead_info': self.projects_lead_info,
                    'person_info': self.person_info,
                    'dead_projects': self.dead_projects
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

    async def fetch_person_lead(self, oib):
        coros = [self._fetch_data(settings.API_PERSONLEAD.replace("{persOib}", oib))]
        self.person_info = await asyncio.gather(*coros, loop=self.loop, return_exceptions=True)
        self.person_info = json.loads(self.person_info[0])
        project_links = self.person_info['_links'].get('projekt', None)
        self.person_info = {
            'first_name': self.person_info['ime'],
            'last_name': self.person_info['prezime'],
            'croris_id': self.person_info['persId'],
            'lead_status': project_links is not None,
            'project_lead_links': project_links
        }

    async def fetch_project_info(self):
        coros = []
        parsed_projects = []

        projects = self.person_info['project_lead_links']
        if projects:
            for project in projects:
                coros.append(self._fetch_data(project['href']))

            self.projects_lead_info = await asyncio.gather(*coros,
                                                           loop=self.loop,
                                                           return_exceptions=True)
            for project in self.projects_lead_info:
                project = json.loads(project)
                metadata = {}
                metadata['end'] = project.get('kraj', None)
                # projects may be outdated
                if metadata['end']:
                    today = datetime.datetime.today()
                    end_date = datetime.datetime.strptime(metadata['end'], '%d.%m.%Y')
                    if end_date <= today:
                        self.dead_projects.append(project.get('id'))
                        continue
                metadata['start'] = project.get('pocetak', None)
                metadata['croris_id'] = project.get('id')
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
