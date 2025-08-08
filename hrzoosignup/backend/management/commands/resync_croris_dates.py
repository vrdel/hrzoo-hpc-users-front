from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project
from backend.utils.institution import InstitutionMap

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception, chunk_list

import logging
import asyncio
import json
import datetime


logger = logging.getLogger('hrzoosignup.tasks')


class Command(BaseCommand):
    help = "Fix user and project institutions by aligning them with the names from CroRIS"

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

    async def _fetch_croris_dates(self, project_ids):
        projects_dates = dict()
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

                        projects_dates[project.get('id')] = {
                            'start': project.get('pocetak'),
                            'end': project.get('kraj')
                        }
                    except TypeError as exc:
                        self.stdout.write(self.style.WARNING(f'Project data extraction failed: {repr(exc)} - {repr(project)}'))
                        continue

            return projects_dates

        finally:
            await self.session.close()

    def _fix_project_dates(self, options, projects_dates):
        any_changed = False

        projects_db = Project.objects.filter(project_type__name='research-croris')

        for project in projects_db:
            try:
                croris_start = datetime.datetime.strptime(projects_dates[project.croris_id]['start'], '%d.%m.%Y').date()
                croris_end = datetime.datetime.strptime(projects_dates[project.croris_id]['end'], '%d.%m.%Y').date()
                if croris_start != project.date_start:
                    self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} date start from {project.date_start} to {croris_start}'))
                    if options.get('confirm_yes', None):
                        project.date_start = croris_start
                        project.croris_start = croris_start
                        project.save()
                        any_changed = True
                if croris_end != project.date_end:
                    self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} date end from {project.date_end} to {croris_end}'))
                    if options.get('confirm_yes', None):
                        project.date_end = croris_end
                        project.croris_end = croris_end
                        project.save()
                        any_changed = True
            except KeyError:
                self.stdout.write(self.style.ERROR(f'No project {project.identifier} found in fetched CroRIS data'))

        return any_changed

    def handle(self, *args, **options):
        any_changed_project = False

        try:
            projects_dates = dict()
            projects_ids = list(Project.objects.filter(project_type__name='research-croris').values_list('croris_id', flat=True))

            for projids in chunk_list(projects_ids, settings.CRORIS_PARALLELSYNCERS):
                chunk = asyncio.run(self._fetch_croris_dates(projids))
                projects_dates.update(chunk)
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        if options.get('confirm_yes', None):
            any_changed_project = self._fix_project_dates(options, projects_dates)

        if any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
