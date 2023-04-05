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
    def __init__(self):
        self.person_info, \
        self.projects_lead_info, \
        self.projects_associate_info = None, None, None
        self.projects_lead_users = {}

        self.dead_projects_associate, \
        self.dead_projects_lead, \
        self.projects_lead_ids, \
        self.projects_associate_ids = [], [], [], []


        self.loop = uvloop.new_event_loop()
        asyncio.set_event_loop(self.loop)

        client_timeout = aiohttp.ClientTimeout(total=10)
        self.session = ClientSession(timeout=client_timeout)
        self.auth = aiohttp.BasicAuth(settings.CRORIS_USER,
                                      settings.CRORIS_PASSWORD)

    def get(self, request):
        oib = cache.get('hzsi@srce.hr_oib')

        try:
            if oib:
                self.loop.run_until_complete(self._fetch_serie(oib))
                self.loop.close()

                return Response({
                    'data': {
                        'person_info': self.person_info,
                        'projects_lead_info': self.projects_lead_info,
                        'projects_lead_users': self.projects_lead_users,
                        'projects_associate_info': self.projects_associate_info,
                        'projects_associate_ids': self.projects_associate_ids,
                    },
                    'status': {
                        'code': status.HTTP_200_OK,
                        'message': 'Successfully fetched the data from CroRIS'
                    }
                })
            elif not oib:
                self.loop.run_until_complete(self.close_session())
                return Response({
                    'status': {
                        'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                        'message': 'Could not get authentication info from cache'
                    }
                })

        except (client_exceptions.ServerTimeoutError, asyncio.TimeoutError) as exc:
            self.loop.run_until_complete(self.close_session())
            return Response({
                'status': {
                    'code': status.HTTP_408_REQUEST_TIMEOUT,
                    'message': 'Could not get data from CroRIS - {}'.format(repr(exc))
                }
            })

        except (client_exceptions.ClientError, http_exceptions.HttpProcessingError) as exc:
            self.loop.run_until_complete(self.close_session())
            return Response({
                'status': {
                    'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                    'message': 'Could not parse data from CroRIS - {}'.format(repr(exc))
                }
            })

    async def _fetch_data(self, url):
        headers = {'Accept': 'application/json'}
        async with self.session.get(url, headers=headers, auth=self.auth) as response:
            content = await response.text()
            if content:
                return content

    async def _fetch_serie(self, oib):
        await self.fetch_person_lead(oib[0].strip())
        await self.fetch_project_lead_info()
        await self.fetch_project_associate_info()
        await self.fetch_users_projects_lead()
        await self.close_session()

    async def fetch_person_lead(self, oib):
        self.person_info = await self._fetch_data(settings.API_PERSONLEAD.replace("{persOib}", oib))

        self.person_info = json.loads(self.person_info)
        project_links = self.person_info['_links'].get('projekt', None)
        self.person_info = {
            'first_name': self.person_info['ime'],
            'last_name': self.person_info['prezime'],
            'croris_id': self.person_info['persId'],
            'lead_status': project_links is not None,
            'project_lead_links': project_links
        }

    async def fetch_project_lead_info(self):
        coros = []
        parsed_projects = []

        projects = self.person_info['project_lead_links']
        if projects:
            if isinstance(projects, list):
                for project in projects:
                    coros.append(self._fetch_data(project['href']))
            else:
                coros.append(self._fetch_data(projects['href']))

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
                        self.dead_projects_lead.append(project.get('id'))
                        continue
                metadata['start'] = project.get('pocetak', None)
                if 'tipProjekta' in project:
                    metadata['type'] = project.get('tipProjekta').get('naziv', None)
                metadata['croris_id'] = project.get('id')
                self.projects_lead_ids.append(metadata['croris_id'])
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

                institute = project['ustanoveResources']
                if institute and institute.get('_embedded', False):
                    institute = institute['_embedded']['ustanove'][0]
                    metadata['institute'] = {
                        'class': institute['klasifikacija']['naziv'],
                        'name': institute['naziv']
                    }

                finance = project['financijerResources']
                if finance and finance.get('_embedded', False):
                    finance = finance['_embedded']['financijeri'][0]
                    metadata['finance'] = finance['entityNameHr']

                parsed_projects.append(metadata)

            self.projects_lead_info = parsed_projects

    async def fetch_project_associate_info(self):
        coros = []
        parsed_projects = []
        persid = self.person_info['croris_id']

        projects_associate_links = await self._fetch_data(settings.API_PERSON.replace("{persId}", str(persid)))
        projects_associate_links = json.loads(projects_associate_links)['_links'].get('projekt', None)
        if not isinstance(projects_associate_links, list):
            projects_associate_links = [projects_associate_links]

        skip_projects = self.dead_projects_lead + self.projects_lead_ids
        projects_associate_links = list(
            filter(lambda l: int(l['href'].split('/')[-1]) not in skip_projects,
                projects_associate_links))

        for project in projects_associate_links:
            coros.append(self._fetch_data(project['href']))

        self.projects_associate_info = await asyncio.gather(*coros,
                                                            loop=self.loop,
                                                            return_exceptions=True)

        for project in self.projects_associate_info:
            project = json.loads(project)
            metadata = {}
            metadata['end'] = project.get('kraj', None)
            # projects may be outdated
            if metadata['end']:
                today = datetime.datetime.today()
                end_date = datetime.datetime.strptime(metadata['end'], '%d.%m.%Y')
                if end_date <= today:
                    self.dead_projects_associate.append(project.get('id'))
                    continue
            metadata['start'] = project.get('pocetak', None)
            metadata['croris_id'] = project.get('id')
            self.projects_associate_ids.append(metadata['croris_id'])
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

        self.projects_associate_info = parsed_projects

    async def fetch_users_projects_lead(self):
        coros = []
        project_users = []
        persid = self.person_info['croris_id']

        for pid in self.projects_lead_ids:
            coros.append(self._fetch_data(settings.API_PERSONPROJECT.replace("{projectId}", str(pid))))

        project_users = await asyncio.gather(*coros, loop=self.loop,
                                             return_exceptions=True)

        i = 0
        for project in project_users:
            project = json.loads(project)
            pid = self.projects_lead_ids[i]
            if pid not in self.projects_lead_users:
                self.projects_lead_users[pid] = []
            for user in project['_embedded']['osobe']:
                if user['klasifikacija']['naziv'] == 'voditelj':
                    continue
                self.projects_lead_users[pid].append(
                    {
                        'first_name': user['ime'],
                        'last_name': user['prezime'],
                        'email': user['email'],
                        'institution': user['ustanovaNaziv']
                    }
                )
            i += 1

    async def close_session(self):
        await self.session.close()
