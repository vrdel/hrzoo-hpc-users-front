from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import get_user_model

import asyncio
import aiohttp
import json
import datetime
import logging

from aiohttp import client_exceptions, http_exceptions, ClientSession


logger = logging.getLogger('hrzoosignup.views')


def contains_exception(list):
    for a in list:
        if isinstance(a, Exception):
            return (True, a)

    return (False, None)


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

    def get(self, request):
        oib = request.user.person_oib

        # we don't set HTTP error statuses on failed data fetchs
        try:
            if oib:
                self.loop = asyncio.new_event_loop()
                asyncio.set_event_loop(self.loop)

                self.loop.run_until_complete(self._fetch_serie(oib))
                self.loop.close()

                user = get_user_model().objects.get(id=self.request.user.id)
                user.croris_first_name = self.person_info.get('first_name', '')
                user.croris_last_name = self.person_info.get('last_name', '')
                user.croris_mail = self.person_info.get('email', '')
                user.save()

                # frontend is calling every 15 min
                # we set here eviction after 20 min
                cache.set(f'{oib}_croris', {
                        'person_info': self.person_info,
                        'projects_lead_info': self.projects_lead_info,
                        'projects_lead_users': self.projects_lead_users,
                        'projects_associate_info': self.projects_associate_info,
                        'projects_associate_ids': self.projects_associate_ids,
                    }, 20 * 60
                )

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
                return Response({
                    'status': {
                        'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                        'message': 'Could not get authentication info from database'
                    }
                })

        except (client_exceptions.ServerTimeoutError, asyncio.TimeoutError) as exc:
            return Response({
                'status': {
                    'code': status.HTTP_408_REQUEST_TIMEOUT,
                    'message': 'Could not get data from CroRIS - {}'.format(repr(exc))
                }
            })

        except (client_exceptions.ClientError, http_exceptions.HttpProcessingError) as exc:
            return Response({
                'status': {
                    'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                    'message': 'Could not parse data from CroRIS - {}'.format(repr(exc))
                }
            })

    def _extract_project_fields(self, apidata):
        metadata = {}
        metadata['end'] = apidata.get('kraj', None)
        # projects may be outdated
        if metadata['end']:
            today = datetime.datetime.today()
            end_date = datetime.datetime.strptime(metadata['end'], '%d.%m.%Y') + datetime.timedelta(days=settings.GRACE_DAYS)
            if end_date <= today:
                self.dead_projects_lead.append(apidata.get('id'))
                return False
        metadata['start'] = apidata.get('pocetak', None)
        if 'tipProjekta' in apidata:
            metadata['type'] = apidata.get('tipProjekta').get('naziv', None)
        metadata['croris_id'] = apidata.get('id')
        self.projects_lead_ids.append(metadata['croris_id'])
        metadata['identifier'] = apidata.get('hrSifraProjekta', None)
        titles = apidata['title']
        for title in titles:
            if title['cfLangCode'] == 'hr':
                metadata['title'] = title['naziv']
                break
        summaries = apidata['summary']
        for summary in summaries:
            if summary['cfLangCode'] == 'hr':
                metadata['summary'] = summary.get('naziv', '')
                break

        institute = apidata['ustanoveResources']
        if institute and institute.get('_embedded', False):
            institute = institute['_embedded']['ustanove'][0]
            metadata['institute'] = {
                'class': institute['klasifikacija']['naziv'],
                'name': institute['naziv']
            }

        finance = apidata['financijerResources']
        if finance and finance.get('_embedded', False):
            financiers = []
            for fin in finance['_embedded']['financijeri']:
                financiers.append(fin['entityNameHr'])
            metadata['finance'] = financiers

        return metadata

    async def _fetch_data(self, url):
        headers = {'Accept': 'application/json'}
        async with self.session.get(url, headers=headers, auth=self.auth) as response:
            content = await response.text()
            if content:
                return content

    async def _fetch_serie(self, oib):
        client_timeout = aiohttp.ClientTimeout(total=20)
        self.session = ClientSession(timeout=client_timeout)
        self.auth = aiohttp.BasicAuth(settings.CRORIS_USER,
                                      settings.CRORIS_PASSWORD)

        await self.fetch_person_lead(oib.strip())
        await self.fetch_project_lead_info()
        await self.fetch_project_associate_info()
        await self.fetch_users_projects_lead()
        await self.filter_unverified()
        await self.extract_email_for_associate()
        await self.close_session()
        self.lead_institute_on_project_associate(oib)

    async def fetch_person_lead(self, oib):
        fetch_data = await self._fetch_data(settings.API_PERSONLEAD.replace("{persOib}", oib))
        fetch_data = json.loads(fetch_data)
        httpcode = fetch_data.get('httpStatusCode', False)
        if httpcode and httpcode != 200:
            raise client_exceptions.ClientError({
                'status': fetch_data['httpStatusCode'],
                'message': fetch_data['errorMessage']
            })

        self.person_info = fetch_data
        # lead_status set from fetch_project_lead_info as projects might be
        # dead
        project_links = self.person_info['_links'].get('projekt', None)
        self.person_info = {
            'first_name': self.person_info['ime'],
            'last_name': self.person_info['prezime'],
            'croris_id': self.person_info['persId'],
            'mbz': self.person_info.get('maticniBrojZnanstvenika', None),
            'lead_status': False,
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
            exc_raised, exc = contains_exception(self.projects_lead_info)
            if exc_raised:
                raise client_exceptions.ClientError(repr(exc))

            for project in self.projects_lead_info:
                project = json.loads(project)
                pr_fields = self._extract_project_fields(project)
                if pr_fields:
                    parsed_projects.append(pr_fields)

            self.projects_lead_info = parsed_projects

            if self.projects_lead_info:
                self.person_info['lead_status'] = True

    async def fetch_project_associate_info(self):
        coros = []
        parsed_projects = []
        persid = self.person_info['croris_id']

        projects_associate_links = await self._fetch_data(settings.API_PERSON.replace("{persId}", str(persid)))
        projects_associate_links = json.loads(projects_associate_links)['_links'].get('projekt', None)
        if not isinstance(projects_associate_links, list):
            projects_associate_links = [projects_associate_links]

        skip_projects = self.dead_projects_lead + self.projects_lead_ids
        if skip_projects:
            projects_associate_links = list(
                filter(lambda l: int(l['href'].split('/')[-1]) not in skip_projects,
                    projects_associate_links))

        if projects_associate_links:
            for project in projects_associate_links:
                if project:
                    coros.append(self._fetch_data(project['href']))
                else:
                    return

            self.projects_associate_info_apidata = await asyncio.gather(*coros,
                    loop=self.loop, return_exceptions=True)

            exc_raised, exc = contains_exception(self.projects_associate_info_apidata)
            if exc_raised:
                raise client_exceptions.ClientError(repr(exc))

            for project in self.projects_associate_info_apidata:
                project = json.loads(project)
                metadata = {}
                metadata['end'] = project.get('kraj', None)
                # projects may be outdated
                if metadata['end']:
                    today = datetime.datetime.today()
                    end_date = datetime.datetime.strptime(metadata['end'], '%d.%m.%Y') + datetime.timedelta(days=settings.GRACE_DAYS)
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
        else:
            self.projects_associate_info = None

    async def filter_unverified(self):
        coros = []
        filter_ids = list()

        for pid in self.projects_associate_ids:
            coros.append(self._fetch_data(settings.API_PROJECT.replace("{projectId}", str(pid))))
        fetched_projects = await asyncio.gather(*coros, loop=self.loop,
                                                return_exceptions=True)

        exc_raised, exc = contains_exception(fetched_projects)
        if exc_raised:
            raise client_exceptions.ClientError(repr(exc))

        for fetched_project in fetched_projects:
            project = json.loads(fetched_project)
            verified = project.get('verified', False)
            if verified and verified.lower() == 'false':
                filter_ids.append(project['id'])
            self.projects_associate_ids = list(filter(
                lambda e: e not in filter_ids,
                self.projects_associate_ids
            ))
            self.projects_associate_info = list(filter(
                lambda p: p['croris_id'] not in filter_ids,
                self.projects_associate_info
            ))

    async def extract_email_for_associate(self):
        if not self.person_info['lead_status']:
            try:
                pid = self.projects_associate_ids[0]
                fetched_project = await self._fetch_data(settings.API_PROJECT.replace("{projectId}", str(pid)))
                project = json.loads(fetched_project)

                for person in project['osobeResources']['_embedded']['osobe']:
                    if person['persId'] == self.person_info['croris_id']:
                        self.person_info['email'] = person.get('email', '')
            except (IndexError, ValueError) as exp:
                pass

    async def fetch_users_projects_lead(self):
        coros = []
        project_users = []
        persid = self.person_info['croris_id']

        for pid in self.projects_lead_ids:
            coros.append(self._fetch_data(settings.API_PERSONPROJECT.replace("{projectId}", str(pid))))

        project_users = await asyncio.gather(*coros, loop=self.loop,
                                             return_exceptions=True)

        exc_raised, exc = contains_exception(project_users)
        if exc_raised:
            raise client_exceptions.ClientError(repr(exc))

        i = 0
        for project in project_users:
            project = json.loads(project)
            pid = self.projects_lead_ids[i]
            if pid not in self.projects_lead_users:
                self.projects_lead_users[pid] = []
            for user in project['_embedded']['osobe']:
                if user['klasifikacija']['naziv'] == 'voditelj':
                    self.person_info['email'] = user.get('email', '')
                    continue
                self.projects_lead_users[pid].append(
                    {
                        'first_name': user['ime'],
                        'last_name': user['prezime'],
                        'oib': user.get('oib', ''),
                        'email': user.get('email', ''),
                        'institution': user['ustanovaNaziv']
                    }
                )
            i += 1

    def lead_institute_on_project_associate(self, oib):
        project_associate_should_lead = list()

        if self.projects_associate_info:
            for project in self.projects_associate_info_apidata:
                prjs = json.loads(project)
                if prjs['id'] in self.projects_associate_ids:
                    eufunded = None
                    finance = prjs['financijerResources']
                    if finance and finance.get('_embedded', False):
                        finances = finance['_embedded']['financijeri']
                        for fin in finances:
                            belong = fin.get('nadleznost', False)
                            if belong:
                                for bel in belong:
                                    if bel['cfLangCode'] == 'hr' and bel['naziv'] == 'Europska unija':
                                        eufunded = True
                                        break
                    if eufunded:
                        project_have_main_leader = None
                        iam_lead_institute = False
                        for person in prjs['osobeResources']['_embedded']['osobe']:
                            if person['klasifikacija']['naziv'].lower() == 'voditelj':
                                project_have_main_leader = True
                            if (person['klasifikacija']['naziv'] == 'voditelj na ustanovi'
                                and person['oib'] == oib):
                                iam_lead_institute = True

                        if not project_have_main_leader and iam_lead_institute:
                            self.projects_associate_ids.remove(prjs['id'])
                            for project in self.projects_associate_info:
                                if project['croris_id'] == prjs['id']:
                                    self.projects_associate_info.remove(project)

                            pr_fields = self._extract_project_fields(prjs)
                            self.projects_lead_info.append(pr_fields)
                            for person in prjs['osobeResources']['_embedded']['osobe']:
                                if prjs['id'] not in self.projects_lead_users:
                                    self.projects_lead_users[prjs['id']] = list()
                                if person['oib'] != oib:
                                    self.projects_lead_users[prjs['id']].append(
                                        {
                                            'first_name': person['ime'],
                                            'last_name': person['prezime'],
                                            'oib': person.get('oib', ''),
                                            'email': person.get('email', ''),
                                            'institution': person['ustanovaNaziv']
                                        }
                                    )
                            self.person_info['lead_status'] = True

    async def close_session(self):
        await self.session.close()
