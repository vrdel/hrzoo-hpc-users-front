import json
import os
import tempfile
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime

import django
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connections, connection


RESOURCE_USAGE_MODEL = 'backend.resourceusage'
BATCH_SIZE = 5000


def _bulk_insert_chunk(chunk, db_settings):
    """
    Worker function that runs in a separate process.
    Each worker sets up its own Django and DB connection.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrzoosignup.settings')
    django.setup()

    from backend.models import ResourceUsage

    objects = []
    for entry in chunk:
        fields = entry['fields']
        objects.append(ResourceUsage(
            pk=entry['pk'],
            user_id=fields.get('user'),
            project_id=fields['project'],
            resource_name=fields.get('resource_name', ''),
            end_time=fields.get('end_time'),
            accounting_record=fields.get('accounting_record'),
        ))

    ResourceUsage.objects.bulk_create(objects, batch_size=BATCH_SIZE, ignore_conflicts=True)

    from django.db import connections as worker_connections
    for conn in worker_connections.all():
        conn.close()

    return len(objects)


class Command(BaseCommand):
    help = "Load data like loaddata but import backend_resourceusage in parallel"

    def add_arguments(self, parser):
        parser.add_argument('fixture', type=str, help='Path to the fixture file (JSON)')
        parser.add_argument('--workers', dest='workers', type=int, default=4,
                            help='Number of parallel workers for resource usage import (default: 4)')

    def handle(self, *args, **options):
        fixture_path = options['fixture']
        num_workers = options['workers']

        self.stdout.write(f'Loading fixture: {fixture_path}')

        with open(fixture_path, 'r') as f:
            all_data = json.load(f)

        resource_usage_records = []
        other_records = []

        for entry in all_data:
            if entry.get('model') == RESOURCE_USAGE_MODEL:
                resource_usage_records.append(entry)
            else:
                other_records.append(entry)

        self.stdout.write(f'Total records: {len(all_data)}')
        self.stdout.write(f'  ResourceUsage records: {len(resource_usage_records)}')
        self.stdout.write(f'  Other records: {len(other_records)}')

        if other_records:
            self.stdout.write('Loading non-ResourceUsage data with loaddata...')
            with tempfile.NamedTemporaryFile(
                mode='w', suffix='.json', delete=False, prefix='fastload_other_'
            ) as tmp:
                json.dump(other_records, tmp)
                tmp_path = tmp.name

            try:
                call_command('loaddata', tmp_path, verbosity=options['verbosity'])
                self.stdout.write(self.style.SUCCESS(
                    f'Loaded {len(other_records)} non-ResourceUsage records'
                ))
            finally:
                os.unlink(tmp_path)

        if resource_usage_records:
            self.stdout.write(
                f'Loading {len(resource_usage_records)} ResourceUsage records '
                f'in parallel with {num_workers} workers...'
            )
            start_time = time.time()

            chunk_size = len(resource_usage_records) // num_workers
            if chunk_size == 0:
                chunk_size = len(resource_usage_records)
            chunks = [
                resource_usage_records[i:i + chunk_size]
                for i in range(0, len(resource_usage_records), chunk_size)
            ]

            db_settings = settings.DATABASES['default']
            total_inserted = 0

            with ProcessPoolExecutor(max_workers=num_workers) as executor:
                futures = {
                    executor.submit(_bulk_insert_chunk, chunk, db_settings): idx
                    for idx, chunk in enumerate(chunks)
                }
                for future in as_completed(futures):
                    chunk_idx = futures[future]
                    try:
                        count = future.result()
                        total_inserted += count
                        self.stdout.write(f'  Worker chunk {chunk_idx + 1}/{len(chunks)} done: {count} records')
                    except Exception as exc:
                        self.stderr.write(self.style.ERROR(
                            f'  Worker chunk {chunk_idx + 1}/{len(chunks)} failed: {exc}'
                        ))

            elapsed = time.time() - start_time
            self.stdout.write(self.style.SUCCESS(
                f'Loaded {total_inserted} ResourceUsage records in {elapsed:.1f}s'
            ))

            self._reset_sequence()

        self.stdout.write(self.style.SUCCESS('Done'))

    def _reset_sequence(self):
        """Reset the primary key sequence for backend_resourceusage after bulk insert."""
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval(pg_get_serial_sequence('backend_resourceusage', 'id'), "
                "COALESCE(MAX(id), 1)) FROM backend_resourceusage;"
            )
        self.stdout.write('Reset backend_resourceusage primary key sequence')
