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


logger = logging.getLogger('hrzoosignup.crons')


class Command(BaseCommand):
    help = "Refresh names of research projects with recent CroRIS names"

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
            "--cron",
            action="store_true",
            dest="cron",
            help="Flag indicating call from cron",
        )

    async def _fetch_croris_names(self, project_ids):
        projects_names = dict()
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
                        titles = project['title']
                        for title in titles:
                            if title['cfLangCode'] == 'hr':
                                break

                        projects_names[project.get('id')] = {
                            'title': title['naziv']
                        }
                    except TypeError as exc:
                        self.stdout.write(self.style.WARNING(f'Project data extraction failed: {repr(exc)} - {repr(project)}'))
                        continue

            return projects_names

        finally:
            await self.session.close()

    def _fix_project_names(self, options, projects_names):
        any_changed = False

        projects_db = Project.objects.filter(project_type__name='research-croris')

        for project in projects_db:
            try:
                if project.name != projects_names[project.croris_id]['title']:
                    new_title = projects_names[project.croris_id]['title']
                    self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} name from \"{project.name}\" to \"{new_title}\"'))
                    if options.get('confirm_yes', None):
                        if options.get('cron', None):
                            logger.info(f'Changing research project {project.identifier} name from \"{project.name}\" to \"{new_title}\"')
                        project.name = new_title
                        project.save()
                        any_changed = True
            except KeyError:
                self.stdout.write(self.style.ERROR(f'No project {project.identifier} found in fetched CroRIS data'))
                if options.get('cron', None):
                    logger.info(f'No project {project.identifier} found in fetched CroRIS data')

        return any_changed

    def handle(self, *args, **options):
        any_changed_project = False

        try:
            projects_names = dict()
            projects_ids = list(Project.objects.filter(project_type__name='research-croris').values_list('croris_id', flat=True))

            for projids in chunk_list(projects_ids, settings.CRORIS_PARALLELSYNCERS):
                chunk = asyncio.run(self._fetch_croris_names(projids))
                projects_names.update(chunk)
        except (HZSIHttpError, KeyboardInterrupt):
            pass

        if options.get('confirm_yes', None):
            any_changed_project = self._fix_project_names(options, projects_names)

        if any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
