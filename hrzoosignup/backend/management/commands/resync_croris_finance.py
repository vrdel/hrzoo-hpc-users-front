from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project
from backend.utils.institution import InstitutionMap
from backend.utils.institution import long_name

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception, chunk_list

import logging
import asyncio
import json


logger = logging.getLogger('hrzoosignup.tasks')


class Command(BaseCommand):
    help = "Refresh research project financiers with recent CroRIS project metadata"

    def __init__(self):
        super().__init__()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirm_yes",
            help="Make changes",
        )
        parser.add_argument(
            "--name-long",
            action="store_true",
            dest="name_long",
            help="Use name_long for financiers",
        )

    async def _fetch_croris_finance(self, options, project_ids):
        project_financiers = dict()
        try:

            auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
            self.session = SessionWithRetry(logger, auth=auth,
                                            handle_session_close=True)
            coros = []
            for project_id in project_ids:
                coros.append(
                    self.session.http_get(settings.API_PROJECT.replace('{projectId}', str(project_id)))
                )

            response = await asyncio.gather(*coros, return_exceptions=True)
            exc_raised, exc = contains_exception(response)

            if exc_raised:
                raise exc
            else:
                for project in response:
                    try:
                        project = json.loads(project)

                        finance = project.get('financijerResources')
                        if finance and finance.get('_embedded', False):
                            financiers = []
                            for fin in finance['_embedded']['financijeri']:
                                financiers.append({
                                    'name': await long_name(fin['entityNameHr'])
                                    if options.get('name_long', None)
                                    else fin['entityNameHr'],
                                    'amount': fin.get('amount', 0),
                                    'currency': fin.get('currencyCode', '')
                                })
                        project_financiers[project.get('id')] = financiers

                    except TypeError as exc:
                        self.stdout.write(self.style.WARNING(f'Project data extraction failed: {repr(exc)} - {repr(project)}'))
                        continue

            return project_financiers

        finally:
            await self.session.close()

    def _fix_project_financiers(self, options, projects_financiers):
        any_changed = False

        projects_db = Project.objects.filter(project_type__name='research-croris')

        for project in projects_db:
            try:
                if options.get('confirm_yes', None):
                    if project.croris_finance != projects_financiers[project.croris_id]:
                        self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} financiers {projects_financiers[project.croris_id]}'))
                        project.croris_finance = projects_financiers[project.croris_id]
                        project.save()
                        any_changed = True
            except KeyError:
                self.stdout.write(self.style.ERROR(f'No project {project.identifier} found in fetched CroRIS data'))

        return any_changed

    def handle(self, *args, **options):
        any_changed_project = None

        try:
            projects_financiers = dict()
            projects_ids = Project.objects.filter(project_type__name='research-croris').values_list('croris_id', flat=True)
            for projids in chunk_list(projects_ids, settings.CRORIS_PARALLELSYNCERS):
                chunk = asyncio.run(self._fetch_croris_finance(options, projids))
                projects_financiers.update(chunk)
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        any_changed_project = self._fix_project_financiers(options, projects_financiers)

        if any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
