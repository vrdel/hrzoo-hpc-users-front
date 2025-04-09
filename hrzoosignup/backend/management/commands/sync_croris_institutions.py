from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.core.cache import cache

from django.db import connections

import asyncio
import os
import logging

from backend.apps import BackendConfig
from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.models import CrorisInstitutions
from backend.tasks.croris_institutions import FetchCrorisInstitution

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Sync institution names from CroRIS"

    def __init__(self):
        super().__init__()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--cron",
            action="store_true",
            dest="cron",
            help="Flag indicating call from cron",
        )

    def _extract_instits_fields(self, institutions, active, options):
        tmp = []
        for inst in institutions:
            try:
                contact = inst.get('kontakt', None)
                parent = inst.get('nadUstanova', None)
                tmp.append(
                    CrorisInstitutions(
                        active=active,
                        name_long=inst['puniNaziv'],
                        parent=parent['naziv'] if parent else '',
                        name_short=inst['kratkiNaziv'],
                        name_acronym=inst.get('kratica', ''),
                        oib=inst.get('oib', '0'),
                        mbs=inst.get('mbs', '0'),
                        mbu=inst.get('mbu', '0'),
                        contact_web=contact.get('web', '') if contact else '',
                        contact_email=contact.get('email', '') if contact else '',
                    )
                )
            except KeyError:
                self.stdout.write(self.style.ERROR(f'Problem extracting keys for entry: {inst}'))
                if options.get('cron', None):
                    logger.error(f'Problem extracting keys for entry: {inst}')

        return tmp

    def reset_serial_sequence(self):
        # hzsi-manage sqlsequencereset backend
        sql = """
        SELECT setval(pg_get_serial_sequence('"backend_crorisinstitutions"', 'id'),
        coalesce(max("id"), 1), max("id") IS NOT null) FROM "backend_crorisinstitutions";
        """

        connection = connections['default']
        with connection.cursor() as cursor:
            cursor.execute(sql)
            # Assuming you are interested in the result:
            result = cursor.fetchone()
        return result

    async def _clean_and_fetch(self):
        await CrorisInstitutions.objects.all().adelete()
        croris_instits = FetchCrorisInstitution()
        task_fetch = asyncio.create_task(croris_instits.run())
        self.inactive_instits, self.active_instits = await task_fetch

    def handle(self, *args, **options):
        try:
            asyncio.run(self._clean_and_fetch())

            self.reset_serial_sequence()

            bulk_inactive = self._extract_instits_fields(self.inactive_instits, False, options)
            bulk_active = self._extract_instits_fields(self.active_instits, True, options)

            self.stdout.write(self.style.NOTICE(f'Synced {len(bulk_inactive)} inactive institutions'))
            if options.get('cron', None):
                logger.info(f'Synced {len(bulk_inactive)} inactive institutions')
            self.stdout.write(self.style.NOTICE(f'Synced {len(bulk_active)} active institutions'))
            if options.get('cron', None):
                logger.info(f'Synced {len(bulk_active)} active institutions')

            CrorisInstitutions.objects.bulk_create(bulk_active)
            CrorisInstitutions.objects.bulk_create(bulk_inactive)

        except (HZSIHttpError, KeyboardInterrupt):
            pass
