from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project
from backend.utils.institution import InstitutionMap
from backend.utils.institution import long_name

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

import logging
import asyncio
import json

from rich.pretty import pprint


logger = logging.getLogger('hrzoosignup.tasks')


class Command(BaseCommand):
    help = "Refresh research project financiers with recent CroRIS project metadata"

    def __init__(self):
        super().__init__()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)

    async def _fetch_publications(self):
        projects_publications = list()
        try:

            projects_db = Project.objects.filter(project_type__name='research-croris')
            auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
            self.session = SessionWithRetry(logger, auth=auth,
                                            handle_session_close=True)
            coros = []
            async for project in projects_db:
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

                        publication = project.get('publikacijaResources')
                        if publication and publication.get('_embedded', False):
                            publications = []
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
                            'date_end': project.get('kraj'),
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
            projects_publications = asyncio.run(self._fetch_publications())
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        pprint(projects_publications, indent_guides=False)
