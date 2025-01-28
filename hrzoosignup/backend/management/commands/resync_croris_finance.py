from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project
from backend.utils.institution_map import InstitutionMap

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

import logging
import asyncio
import json


logger = logging.getLogger('hrzoosignup.tasks')


class Command(BaseCommand):
    help = "Refresh research project financiers with recent CroRIS project metadata"

    def __init__(self):
        super().__init__()
        self.inst_maps = InstitutionMap()
        self.user_model = get_user_model()

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

    async def _task_resync_croris_finance(self):
        project_financiers = dict()
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

                        finance = project.get('financijerResources')
                        if finance and finance.get('_embedded', False):
                            financiers = []
                            for fin in finance['_embedded']['financijeri']:
                                financiers.append({
                                    'name': fin['entityNameHr'],
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

    def _task_fix_project_financiers(self, options, projects_financiers):
        any_changed = False

        projects_db = Project.objects.filter(project_type__name='research-croris')

        for project in projects_db:
            try:
                self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} financiers {projects_financiers[project.croris_id]}'))
                if options.get('confirm_yes', None):
                    project.croris_finance = projects_financiers[project.croris_id]
                    project.save()
                    any_changed = True
            except KeyError:
                self.stdout.write(self.style.ERROR(f'No project {project.identifier} found in fetched CroRIS data'))

        return any_changed

    def handle(self, *args, **options):
        any_changed_project = False

        try:
            projects_financiers = asyncio.run(self._task_resync_croris_finance())
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        any_changed_project = self._task_fix_project_financiers(options, projects_financiers)

        if any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
