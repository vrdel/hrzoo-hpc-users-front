from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.models import Project
from backend.models import UserProject
from backend.models import CrorisInstitutions
from backend.utils.institution import InstitutionMap

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception, chunk_list

import logging
import asyncio
import json


logger = logging.getLogger('hrzoosignup.crons')


class Command(BaseCommand):
    help = "Fix user and project institutions by aligning them with the names from CroRIS. Alo set realms institutions."

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
            "--project",
            action="store_true",
            dest="project_yes",
            help="Fix project lead institution",
        )
        parser.add_argument(
            "--research-project-resync-institutions",
            action="store_true",
            dest="research_resync_yes",
            help="Resync institutions for all submitted CroRIS research projects",
        )
        parser.add_argument(
            "--set-realm-institutions",
            action="store_true",
            dest="realm_yes",
            help="Set realm for project institution",
        )
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

    async def _fetch_croris_institutions(self, options, project_ids):
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
                projects_institutes = list()
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
                    projects_institutes.append({
                        'id': project['id'],
                        'institutes': metadata_institutes
                    })

                return projects_institutes

        finally:
            await self.session.close()

    async def _apply_changes_institutions(self, options, projects_institutes):
        any_changed = False
        projects_db = Project.objects.all()
        for pi in projects_institutes:
            target = await projects_db.aget(croris_id=pi['id'])
            if target.croris_institute != pi['institutes']:
                any_changed = True
                target.croris_institute = pi['institutes']
                self.stdout.write(self.style.NOTICE(f'Changing croris_institute for {target.croris_identifier} to {pi["institutes"]}'))
                if options.get('cron', None):
                    logger.info(f'Changing croris_institute for {target.croris_identifier} to {pi["institutes"]}')
                await target.asave()

        return any_changed

    def _fix_project_institutions(self, options):
        any_changed = False
        projects_croris = Project.objects.filter(project_type__name='research-croris')
        projects_other = Project.objects.exclude(project_type__name='research-croris')

        for project in projects_croris:
            eu_finance = len([fin for fin in project.croris_finance if 'Europska unija'.lower() in fin['name'].lower()]) != 0
            if eu_finance:
                userproj = UserProject.objects.filter(project_id=project.id).filter(role__name='lead')
                userlead_institution = userproj[0].user.person_institution
                if project.institute != userlead_institution:
                    self.stdout.write(self.style.NOTICE(f'Changing EU research project {project.identifier} institute of lead institute: {userlead_institution}'))
                    if options.get('cron', None):
                        logger.info(f'Changing EU research project {project.identifier} institute of lead institute: {userlead_institution}')
                    if options.get('confirm_yes', None):
                        project.institute = userlead_institution
                        any_changed = True
                        project.save()
            else:
                holder = [hold for hold in project.croris_institute if hold['class'].lower() == 'nositelj'.lower()]
                if len(holder) == 1 and project.institute != holder[0]['name']:
                    self.stdout.write(self.style.NOTICE(f"Changing research project {project.identifier} institute of holder: {holder[0]['name']}"))
                    if options.get('cron', None):
                        logger.info(f"Changing research project {project.identifier} institute of holder: {holder[0]['name']}")
                    if options.get('confirm_yes', None):
                        project.institute = holder[0]['name']
                        any_changed = True
                        project.save()
                if len(holder) > 1:
                    userproj = UserProject.objects.filter(project_id=project.id).filter(role__name='lead')
                    userlead_institution = userproj[0].user.person_institution
                    if project.institute != userlead_institution:
                        self.stdout.write(self.style.NOTICE(f'Changing research project {project.identifier} institute with multiple holders to that of lead institute: {project.institute}'))
                        if options.get('cron', None):
                            logger.info(f'Changing research project {project.identifier} institute with multiple holders to that of lead institute: {project.institute}')
                        if options.get('confirm_yes', None):
                            project.institute = userlead_institution
                            any_changed = True
                            project.save()
        for project in projects_other:
            userproj = UserProject.objects.filter(project_id=project.id).filter(role__name='lead')
            userlead_institution = userproj[0].user.person_institution
            if project.institute != userlead_institution:
                self.stdout.write(self.style.NOTICE(f'Changing project {project.identifier} institute of lead institute: {userlead_institution}'))
                if options.get('cron', None):
                    logger.info(f'Changing project {project.identifier} institute of lead institute: {userlead_institution}')
                if options.get('confirm_yes', None):
                    project.institute = userlead_institution
                    any_changed = True
                    project.save()

        return any_changed

    def _fix_user_institutions(self, options):
        any_changed = False
        users = self.user_model.objects.all()
        for user in users:
            try:
                if user.person_institution_manual_set:
                    continue
                user_inst_oib = user.person_institution_oib
                croris_institute = CrorisInstitutions.objects.get(oib=user_inst_oib)

                if user_inst_oib and croris_institute:
                    if user.person_institution != croris_institute.name_short and not user.person_institution_manual_set:
                        old_institution = user.person_institution if user.person_institution else 'NONE'
                        self.stdout.write(self.style.NOTICE(f'User {user.username} old institution name {old_institution} updated to new CroRIS name {croris_institute}'))
                        if options.get('cron', None):
                            logger.info(f'User {user.username} institution name updated to new CroRIS name {croris_institute}')
                        if options.get('confirm_yes', None):
                            any_changed = True
                            user.person_institution = croris_institute.name_short
                            user.save()

            except CrorisInstitutions.DoesNotExist:
                pass

            except CrorisInstitutions.MultipleObjectsReturned:
                self.stdout.write(self.style.WARNING(f'Multiple institutions with same OIB found for {user.username}'))
                institutions_duplicate_oib = CrorisInstitutions.objects.filter(oib=user_inst_oib)
                for inst in institutions_duplicate_oib:
                    self.stdout.write(self.style.WARNING(f'{inst.oib} {inst.name_short}'))
                if options.get('cron', None):
                    logger.warning(f'Multiple institutions with same OIB found for {user.username}')
                    for inst in institutions_duplicate_oib:
                        logger.warning(f'{inst.oib} {inst.name_short}')
                continue

            try:
                email_domain = user.person_mail.split('@')[1]
                if 'gmail' in email_domain or 'biocentre' in email_domain:
                    continue
                person_id_domain = user.person_uniqueid.split('@')[1]
            except IndexError:
                continue
            try:
                query = Q()
                if 'forenzi' in user.person_organisation:
                    foren_st = CrorisInstitutions.objects.get(contact_email='forenzika@forenzika.unist.hr')
                    if user.person_institution != foren_st.name_short:
                        self.stdout.write(self.style.NOTICE(f'Setting active institution for {user.username} to {foren_st.name_short}'))
                        if options.get('cron', None):
                            logger.info(f'Setting active institution for {user.username} to {foren_st.name_short}')
                    if options.get('confirm_yes', None):
                        if user.person_institution != foren_st.name_short:
                            user.person_institution = foren_st.name_short
                            user.person_institution_manual_set = True
                            any_changed = True
                            user.save()
                if 'pmf' in person_id_domain or 'ffzg' in person_id_domain:
                    query |= Q(contact_web__contains=person_id_domain, active=True)
                    query |= Q(contact_email__contains=person_id_domain, active=True)
                else:
                    query |= Q(contact_web__contains=email_domain, active=True)
                    query |= Q(contact_email__contains=email_domain, active=True)
                found = CrorisInstitutions.objects.get(query)
                if user.person_institution != found.name_short:
                    user.person_institution = found.name_short
                    self.stdout.write(self.style.NOTICE(f'Setting active institution for {user.username} to {found.name_short}'))
                    if options.get('cron', None):
                        logger.info(f'Setting active institution for {user.username} to {found.name_short}')
                    if options.get('confirm_yes', None):
                        user.person_institution_manual_set = True
                        any_changed = True
                        user.save()
            except CrorisInstitutions.MultipleObjectsReturned:
                if 'pmf' in person_id_domain or 'ffzg' in person_id_domain:
                    query |= Q(contact_web__contains=person_id_domain, active=True)
                    query |= Q(contact_email__contains=person_id_domain, active=True)
                else:
                    query |= Q(contact_web__contains=email_domain, active=True)
                    query |= Q(contact_email__contains=email_domain, active=True)
                multiple_found = CrorisInstitutions.objects.filter(query)
                for found in multiple_found:
                    if user.person_institution in multiple_found.values_list('name_short', flat=True):
                        continue
                    if user.person_organisation and (user.person_organisation.lower() in found.name_acronym.lower() or user.person_organisation.lower() in found.contact_email.lower()):
                        if user.person_institution != found.name_short:
                            user.person_institution = found.name_short
                            self.stdout.write(self.style.NOTICE(f'Resolving active institution for {user.username} to {found.name_short}'))
                            if options.get('cron', None):
                                logger.info(f'Resolving active institution for {user.username} to {found.name_short}')
                            if options.get('confirm_yes', None):
                                user.person_institution_manual_set = True
                                any_changed = True
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
                        if options.get('cron', None):
                            logger.info(f'Setting inactive institution for {user.username} to {found.name_short}')
                        if options.get('confirm_yes', None):
                            user.person_institution_manual_set = True
                            any_changed = True
                            user.save()
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
                                if options.get('cron', None):
                                    logger.info(f'Resolving inactive institution for {user.username} to {found.name_short}')
                                if options.get('confirm_yes', None):
                                    any_changed = True
                                    user.person_institution_manual_set = True
                                    user.save()
                except CrorisInstitutions.DoesNotExist:
                    pass

            if user.person_institution in self.inst_maps.all_from():
                institution_map = self.inst_maps.get(user.person_institution)
                if user.person_institution != institution_map:
                    user.person_institution = institution_map
                    self.stdout.write(self.style.NOTICE(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}'))
                    if options.get('cron', None):
                        logger.info(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}')
                    if options.get('confirm_yes', None):
                        user.person_institution_manual_set = True
                        any_changed = True
                        user.save()

        for user in users:
            if 'gmail' in user.person_mail:
                if user.person_institution in self.inst_maps.all_from():
                    user.person_institution = self.inst_maps.get(user.person_institution)
                    self.stdout.write(self.style.NOTICE(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}'))
                    if options.get('cron', None):
                        logger.info(f'Setting institution from institution_map.json for {user.username} to {user.person_institution}')
                    if options.get('confirm_yes', None):
                        any_changed = True
                        user.save()
                if user.person_institution == 'Sveučilište Josipa Jurja Strossmayera u Osijeku' and user.person_organisation:
                    user.person_institution = f'{user.person_institution}, {user.person_organisation}'
                    self.stdout.write(self.style.NOTICE(f'Joining institution and organisation for {user.username} to {user.person_institution}'))
                    if options.get('cron', None):
                        logger.info(f'Joining institution and organisation for {user.username} to {user.person_institution}')
                    if options.get('confirm_yes', None):
                        any_changed = True
                        user.person_institution_manual_set = True
                        user.save()

        return any_changed

    def _set_realm_institutions(self, options):
        any_changed = False
        users = self.user_model.objects.all()
        for user in users:
            visited_inst, inst_croris = set(), None
            inst_oib = user.person_institution_oib
            if inst_oib and inst_oib not in visited_inst:
                try:
                    inst_croris = CrorisInstitutions.objects.get(oib=inst_oib)
                    if user.person_institution_realm and not inst_croris.realm:
                        inst_croris.realm = user.person_institution_realm
                        self.stdout.write(self.style.NOTICE(f'Setting realm for {inst_croris.name_short} to {inst_croris.realm}'))
                        if options.get('cron', None):
                            logger.info(f'Setting realm for {inst_croris.name_short} to {inst_croris.realm}')
                        if options.get('confirm_yes', None):
                            any_changed = True
                            inst_croris.save()
                    visited_inst.add(inst_oib)
                except CrorisInstitutions.DoesNotExist:
                    pass

        return any_changed

    def handle(self, *args, **options):
        any_changed_user, any_changed_project = False, False

        if options.get('user_yes', None):
            any_changed_user = self._fix_user_institutions(options)

        if options.get('research_resync_yes', None):
            projects_institutes = list()
            projects_ids = Project.objects.filter(project_type__name='research-croris').values_list('croris_id', flat=True)
            try:
                for projids in chunk_list(projects_ids, settings.CRORIS_PARALLELSYNCERS):
                    chunk = asyncio.run(self._fetch_croris_institutions(options, projids))
                    projects_institutes += chunk
                if options.get('confirm_yes', None):
                    any_changed_project = asyncio.run(self._apply_changes_institutions(options, projects_institutes))
            except (HZSIHttpError, KeyboardInterrupt):
                pass

        if options.get('project_yes', None):
            any_changed_project = self._fix_project_institutions(options)

        if options.get('realm_yes', None):
            self._set_realm_institutions(options)

        if any_changed_user or any_changed_project:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
