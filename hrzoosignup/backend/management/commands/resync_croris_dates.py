from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.utils.gen_username import gen_username
from backend.models import User
from backend.models import Project
from backend.models import UserProject
from backend.models import CrorisInstitutions
from backend.utils.institution_map import InstitutionMap

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

import logging
import asyncio
import json
import datetime

import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"

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

    async def _task_resync_croris_dates(self):
        projects_dates = dict()
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
                    project = json.loads(project)

                    projects_dates[project.get('hrSifraProjekta')] = {
                        'start': project.get('pocetak'),
                        'end': project.get('kraj')
                    }

            return projects_dates

        finally:
            await self.session.close()

    def _task_fix_project_dates(self, projects_dates):
        any_changed = False

        projects_db = Project.objects.filter(project_type__name='research-croris')

        for project in projects_db:
            try:
                croris_start = datetime.datetime.strptime(projects_dates[project.identifier]['start'], '%d.%m.%Y').date()
                croris_end = datetime.datetime.strptime(projects_dates[project.identifier]['end'], '%d.%m.%Y').date()
                if croris_start != project.date_start:
                    self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} date start from {project.date_start} to {croris_start}'))
                if croris_end != project.date_end:
                    self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} date end from {project.date_end} to {croris_end}'))
            except KeyError:
                self.stdout.write(self.style.ERROR(f'No project {project.identifier} found in fetched CroRIS data'))

        return any_changed

    def handle(self, *args, **options):
        any_changed_project = False

        try:
            projects_dates = asyncio.run(self._task_resync_croris_dates())
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        if options.get('confirm_yes', None):
            any_changed_project = self._task_fix_project_dates(projects_dates)

        if any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
