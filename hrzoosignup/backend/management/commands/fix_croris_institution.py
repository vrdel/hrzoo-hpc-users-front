from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.utils.gen_username import gen_username
from backend.models import User
from backend.models import Project
from backend.models import CrorisInstitutions
from backend.utils.institution_map import InstitutionMap

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception

import logging
import asyncio
import json

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
            "--user",
            action="store_true",
            dest="user_yes",
            help="Set user person_institution to CroRIS names",
        )
        parser.add_argument(
            "--research-project-resync-institutions",
            action="store_true",
            dest="research_resync_yes",
            help="Set user person_institution to CroRIS names",
        )
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirm_yes",
            help="Make changes",
        )

    async def _task_resync_croris_institutions(self, options, projects):
        any_changed = False
        try:
            projects_db = Project.objects.all()
            auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
            self.session = SessionWithRetry(logger, auth=auth,
                                            handle_session_close=True)
            coros = []
            async for project in projects:
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
                    metadata_institutes = []
                    institutions = project.get('ustanoveResources', None)
                    if institutions:
                        for institute in institutions['_embedded']['ustanove']:
                            metadata_institutes.append(
                                {
                                    'class': institute['klasifikacija']['naziv'],
                                    'name': institute['naziv']

                                }
                            )
                        if options.get('confirm_yes', None):
                            target = await projects_db.aget(croris_id=project['id'])
                            any_changed = True
                            target.croris_institute = metadata_institutes
                            self.stdout.write(self.style.NOTICE(f'Changing croris_institute for {target.croris_identifier}'))
                            await target.asave()

            return any_changed

        finally:
            await self.session.close()

    def _task_fix_user_institutions(self, options):
        any_changed = False
        users = self.user_model.objects.all()
        for user in users:
            try:
                email_domain = user.person_mail.split('@')[1]
                if 'gmail' in email_domain:
                    continue
                person_id_domain = user.person_uniqueid.split('@')[1]
            except IndexError:
                continue
            try:
                query = Q()
                if 'pmf' in person_id_domain:
                    query |= Q(contact_web__contains=person_id_domain, active=True)
                    query |= Q(contact_email__contains=person_id_domain, active=True)
                else:
                    query |= Q(contact_web__contains=email_domain, active=True)
                    query |= Q(contact_email__contains=email_domain, active=True)
                found = CrorisInstitutions.objects.get(query)
                if user.person_institution != found.name_short:
                    user.person_institution = found.name_short
                    self.stdout.write(self.style.NOTICE(f'Setting active institution for {user.username} to {found.name_short}'))
                    any_changed = True
                    if options.get('confirm_yes', None):
                        user.save()
            except CrorisInstitutions.MultipleObjectsReturned:
                if 'pmf' in person_id_domain:
                    query |= Q(contact_web__contains=person_id_domain, active=True)
                    query |= Q(contact_email__contains=person_id_domain, active=True)
                else:
                    query |= Q(contact_web__contains=email_domain, active=True)
                    query |= Q(contact_email__contains=email_domain, active=True)
                multiple_found = CrorisInstitutions.objects.filter(query)
                for found in multiple_found:
                    if user.person_organisation and (user.person_organisation.lower() in found.name_acronym.lower() or user.person_organisation.lower() in found.contact_email.lower()):
                        if user.person_institution != found.name_short:
                            user.person_institution = found.name_short
                            self.stdout.write(self.style.NOTICE(f'Resolving active institution for {user.username} to {found.name_short}'))
                            if options.get('confirm_yes', None):
                                user.save()
            except CrorisInstitutions.DoesNotExist:
                try:
                    query = Q()
                    query |= Q(contact_web__contains=email_domain, active=False)
                    query |= Q(contact_email__contains=email_domain, active=False)
                    found = CrorisInstitutions.objects.get(query)
                    if user.person_institution != found.name_short:
                        user.person_institution = found.name_short
                        self.stdout.write(self.style.NOTICE(f'Setting inactive institution for {user.username} to {found.name_short}'))
                        if options.get('confirm_yes', None):
                            user.save()
                            any_changed = True
                except CrorisInstitutions.MultipleObjectsReturned:
                    query = Q()
                    query |= Q(contact_web__contains=email_domain, active=False)
                    query |= Q(contact_email__contains=email_domain, active=False)
                    multiple_found = CrorisInstitutions.objects.filter(query)
                    for found in multiple_found:
                        if user.person_organisation and user.person_organisation.lower() in found.name_acronym.lower():
                            if user.person_institution != found.name_short:
                                user.person_institution = found.name_short
                                self.stdout.write(self.style.NOTICE(f'Resolving inactive institution for {user.username} to {found.name_short}'))
                                if options.get('confirm_yes', None):
                                    any_changed = True
                                    user.save()
                except CrorisInstitutions.DoesNotExist:
                    pass

            if user.person_institution in self.inst_maps.all_from():
                user.person_institution = self.inst_maps.get(user.person_institution)
                self.stdout.write(self.style.NOTICE(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}'))
                if options.get('confirm_yes', None):
                    any_changed = True
                    user.save()

        for user in users:
            if 'gmail' in user.person_mail:
                if user.person_institution in self.inst_maps.all_from():
                    user.person_institution = self.inst_maps.get(user.person_institution)
                    self.stdout.write(self.style.NOTICE(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}'))
                    if options.get('confirm_yes', None):
                        any_changed = True
                        user.save()
                if user.person_institution == 'Sveučilište Josipa Jurja Strossmayera u Osijeku' and user.person_organisation:
                    user.person_institution = f'{user.person_institution}, {user.person_organisation}'
                    self.stdout.write(self.style.NOTICE(f'Joining institution and organisation for {user.username} to {user.person_institution}'))
                    if options.get('confirm_yes', None):
                        any_changed = True
                        user.save()

        return any_changed

    def handle(self, *args, **options):
        any_changed_user, any_changed_project = False, False

        if options.get('user_yes', None):
            any_changed_user = self._task_fix_user_institutions(options)

        if options.get('research_resync_yes', None):
            projects_all = Project.objects.filter(project_type__name='research-croris')
            try:
                any_changed_project = asyncio.run(self._task_resync_croris_institutions(options, projects_all))
            except (HZSIHttpError, KeyboardInterrupt):
                pass

        if any_changed_user or any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
