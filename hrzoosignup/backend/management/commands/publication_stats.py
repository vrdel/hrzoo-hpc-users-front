from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.models import Project
from backend.utils.institution import InstitutionMap
from backend.utils.institution import long_name

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

from datetime import date
import asyncio
import datetime
import json
import logging

from rich.pretty import pprint


logger = logging.getLogger('hrzoosignup.tasks')


class Command(BaseCommand):
    help = "Refresh research project financiers with recent CroRIS project metadata"

    def __init__(self):
        super().__init__()

    def _parse_enddate(self, dt):
        try:
            if type(dt) is str:
                return datetime.datetime.strptime(dt, '%Y-%m-%d').date()
            else:
                return dt
        except ValueError as exc:
            self.stdout.write(self.style.ERROR('Format end-date not correct'))
            self.stdout.write(self.style.NOTICE(repr(exc)))
            raise SystemExit(1)

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument('--filter-end-date', dest='enddate', type=str, default=date.today(), required=False)

    async def _fetch_publications(self, options):
        projects_publications = list()
        self.end_date = self._parse_enddate(options.get('enddate'))

        try:
            projects_db = Project.objects.filter(project_type__name='research-croris')

            auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
            self.session = SessionWithRetry(logger, auth=auth,
                                            handle_session_close=True)
            coros = []
            async for project in projects_db:
                date_1 = project.date_end if project.date_end else datetime.date(1970, 1, 1)
                date_2 = project.bogus_end if project.bogus_end else datetime.date(1970, 1, 1)
                target_date = max(date_1, date_2)
                if target_date >= self.end_date:
                    coros.append(
                        self.session.http_get(settings.API_PROJECT.replace('{projectId}', str(project.croris_id)))
                    )

            response = await asyncio.gather(*coros, return_exceptions=True)
            exc_raised, exc = contains_exception(response)

            if exc_raised:
                raise exc
            else:
                for project in response:
                    try:
                        project = json.loads(project)
                        publications = []

                        publication = project.get('publikacijaResources')
                        if publication and publication.get('_embedded', False):
                            for pub in publication['_embedded']['publikacije']:
                                publications.append({
                                    'name': pub.get('naslov', ''),
                                    'authors': pub.get('autori', ''),
                                    'cfResPublId': pub.get('cfResPublId', ''),
                                    'doi': pub.get('doi', ''),
                                    'eissn': pub.get('eissn', ''),
                                })
                        project_metadata = dict()
                        titles = project['title']
                        for title in titles:
                            if title['cfLangCode'] == 'hr':
                                project_metadata['title'] = title['naziv']
                                break
                        project_db_metadata = await projects_db.aget(croris_id=project.get('id'))

                        project_metadata.update({
                            'identifier': project.get('hrSifraProjekta', ''),
                            'croris_id': project.get('id'),
                            'date_end': datetime.datetime.strptime(project.get('kraj'), '%d.%m.%Y').replace(hour=23, minute=59),
                            'bogus_end': project_db_metadata.bogus_end,
                            'publications': publications,
                        })
                        projects_publications.append(project_metadata)

                    except TypeError as exc:
                        self.stdout.write(self.style.WARNING(f'Project data extraction failed: {repr(exc)} - {repr(project)}'))
                        continue

            return projects_publications

        finally:
            await self.session.close()

    def handle(self, *args, **options):
        try:
            projects_publications = asyncio.run(self._fetch_publications(options))
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        pprint(projects_publications, indent_guides=False)
        publications_set = set()
        publications = list()
        for pr_pub in projects_publications:
            for pub in pr_pub['publications']:
                publications_set.add(pub['cfResPublId'])
                publications.append(pub['cfResPublId'])
        pprint(f"Projects = {len(projects_publications)}, Publications = {len(publications)}, Unique publications = {len(publications_set)}")
