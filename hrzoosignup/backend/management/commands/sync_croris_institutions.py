from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.core.cache import cache

from django.db import connections

import asyncio
import os

from backend.apps import BackendConfig
from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.models import CrorisInstitutions
from backend.tasks.croris_institutions import FetchCrorisInstitution


class Command(BaseCommand):
    help = "Subscribe eligible users to mailing list"

    def __init__(self):
        super().__init__()

    def _extract_instits_fields(self, institutions, active):
        tmp = []
        for inst in institutions:
            contact = inst.get('kontakt', None)
            tmp.append(
                CrorisInstitutions(
                    active=active,
                    name_long=inst['puniNaziv'],
                    name_short=inst['kratkiNaziv'],
                    name_acronym=inst.get('kratica', ''),
                    oib=inst.get('oib', '0'),
                    mbs=inst.get('mbs', '0'),
                    mbu=inst.get('mbu', '0'),
                    contact_web=contact.get('web', '') if contact else '',
                    contact_email=contact.get('email', '') if contact else '',
                )
            )
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

            bulk_inactive = self._extract_instits_fields(self.inactive_instits, False)
            bulk_active = self._extract_instits_fields(self.active_instits, True)

            self.stdout.write(self.style.NOTICE(f'Synced {len(bulk_inactive)} inactive institutions'))
            self.stdout.write(self.style.NOTICE(f'Synced {len(bulk_active)} active institutions'))

            CrorisInstitutions.objects.bulk_create(bulk_active)
            CrorisInstitutions.objects.bulk_create(bulk_inactive)

        except (HZSIHttpError, KeyboardInterrupt):
            pass
