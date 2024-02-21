import asyncio
import datetime
import json
import logging

from django.conf import settings

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

from aiohttp import client_exceptions, http_exceptions

logger = logging.getLogger('hrzoosignup.views')


class CroRISCore(object):
    def __init__(self, oib):
        self.target_oib = oib.strip()
        self.person_info = None
        self.projects_lead_info = None
        self.projects_associate_info = None
        self.projects_lead_users = {}

        self.dead_projects_associate = []
        self.dead_projects_lead = []
        self.projects_lead_ids = []
        self.projects_associate_ids = []

    def fetch(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._fetch_serie())
        self.loop.close()

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
            metadata['institute'] = list()
            for ins in institute['_embedded']['ustanove']:
                metadata['institute'].append({
                    'class': ins['klasifikacija']['naziv'],
                    'name': ins['naziv']
                })

        finance = apidata['financijerResources']
        if finance and finance.get('_embedded', False):
            financiers = []
            for fin in finance['_embedded']['financijeri']:
                financiers.append(fin['entityNameHr'])
            metadata['finance'] = financiers

        return metadata

    async def _fetch_data(self, url):
        headers = {'Accept': 'application/json'}
        content = await self.session.http_get(url, headers=headers)
        if content:
            return content

    async def _fetch_serie(self):
        auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
        self.session = SessionWithRetry(logger, auth=auth,
                                        handle_session_close=True)

        await self._fetch_person_lead()
        await self._fetch_project_lead_info()
        await self._fetch_project_associate_info()
        await self._fetch_users_projects_lead()
        await self._filter_unverified()
        await self._extract_email_for_associate()
        await self._close_session()
        self._lead_institute_on_project_associate()

    async def _fetch_person_lead(self):
        fetch_data = await self._fetch_data(settings.API_PERSONLEAD.replace("{persOib}", self.target_oib))
        try:
            fetch_data = json.loads(fetch_data)
        except (json.JSONDecodeError, TypeError) as exc:
            logger.error('fetch_person_lead() - Failed JSON parse')
            raise exc

        httpcode = fetch_data.get('httpStatusCode', False)
        if httpcode and httpcode != 200:
            logger.error('fetch_person_lead() - Erroneous HTTP status from CroRIS')
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

    async def _fetch_project_lead_info(self):
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
        else:
            self.person_info['lead_status'] = False
            self.projects_lead_info = []

    async def _fetch_project_associate_info(self):
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
                    self.projects_associate_info = []
                    return

            self.projects_associate_info_apidata = await asyncio.gather(*coros,
                                                                        loop=self.loop,
                                                                        return_exceptions=True)

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
            self.projects_associate_info = []

    async def _filter_unverified(self):
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

    async def _extract_email_for_associate(self):
        if not self.person_info['lead_status']:
            try:
                pid = self.projects_associate_ids[0]
                fetched_project = await self._fetch_data(settings.API_PROJECT.replace("{projectId}", str(pid)))
                project = json.loads(fetched_project)

                for person in project['osobeResources']['_embedded']['osobe']:
                    if person['persId'] == self.person_info['croris_id']:
                        self.person_info['email'] = person.get('email', '')
            except (IndexError, ValueError):
                pass

    async def _fetch_users_projects_lead(self):
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

    def _lead_institute_on_project_associate(self):
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
                                and person.get('oib', 0) == self.target_oib):
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
                                if person.get('oib', 0) != self.target_oib:
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

    async def _close_session(self):
        await self.session.close()
