import json
import os
import tempfile
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

import django
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection


RESOURCE_USAGE_MODEL = 'backend.resourceusage'
BATCH_SIZE = 5000


def _bulk_insert_from_file(tmp_path):
    """
    Worker function that runs in a separate process.
    Reads ResourceUsage records from a temp JSON file and bulk inserts them.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrzoosignup.settings')
    django.setup()

    from backend.models import ResourceUsage
    from django.db import connections as worker_connections

    with open(tmp_path, 'r') as f:
        chunk = json.load(f)

    total = 0
    batch = []
    for entry in chunk:
        fields = entry['fields']
        batch.append(ResourceUsage(
            pk=entry['pk'],
            user_id=fields.get('user'),
            project_id=fields['project'],
            resource_name=fields.get('resource_name', ''),
            end_time=fields.get('end_time'),
            accounting_record=fields.get('accounting_record'),
        ))
        if len(batch) >= BATCH_SIZE:
            ResourceUsage.objects.bulk_create(batch, batch_size=BATCH_SIZE, ignore_conflicts=True)
            total += len(batch)
            batch = []

    if batch:
        ResourceUsage.objects.bulk_create(batch, batch_size=BATCH_SIZE, ignore_conflicts=True)
        total += len(batch)

    for conn in worker_connections.all():
        conn.close()

    return total


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
        start_time = time.time()

        other_tmp = tempfile.NamedTemporaryFile(
            mode='w', suffix='.json', delete=False, prefix='fastload_other_'
        )
        chunk_tmp_files = []
        current_chunk = []
        chunk_records_per_file = 0
        resource_usage_count = 0
        other_count = 0

        self.stdout.write('Splitting fixture into chunks...')
        with open(fixture_path, 'r') as f:
            all_data = json.load(f)

        total_usage = sum(1 for entry in all_data if entry.get('model') == RESOURCE_USAGE_MODEL)
        chunk_target_size = max(total_usage // num_workers, 1) if total_usage > 0 else 1

        other_records = []
        for entry in all_data:
            if entry.get('model') == RESOURCE_USAGE_MODEL:
                current_chunk.append(entry)
                resource_usage_count += 1
                if len(current_chunk) >= chunk_target_size:
                    tmp = tempfile.NamedTemporaryFile(
                        mode='w', suffix='.json', delete=False,
                        prefix=f'fastload_chunk{len(chunk_tmp_files)}_'
                    )
                    json.dump(current_chunk, tmp)
                    tmp.close()
                    chunk_tmp_files.append(tmp.name)
                    current_chunk = []
            else:
                other_records.append(entry)
                other_count += 1

        if current_chunk:
            tmp = tempfile.NamedTemporaryFile(
                mode='w', suffix='.json', delete=False,
                prefix=f'fastload_chunk{len(chunk_tmp_files)}_'
            )
            json.dump(current_chunk, tmp)
            tmp.close()
            chunk_tmp_files.append(tmp.name)
            current_chunk = []

        del all_data

        self.stdout.write(f'  ResourceUsage records: {resource_usage_count} (in {len(chunk_tmp_files)} chunks)')
        self.stdout.write(f'  Other records: {other_count}')

        if other_records:
            self.stdout.write('Loading non-ResourceUsage data with loaddata...')
            json.dump(other_records, other_tmp)
            other_tmp_path = other_tmp.name
            other_tmp.close()
            del other_records

            try:
                call_command('loaddata', other_tmp_path, verbosity=options['verbosity'])
                self.stdout.write(self.style.SUCCESS(
                    f'Loaded {other_count} non-ResourceUsage records'
                ))
            finally:
                os.unlink(other_tmp_path)
        else:
            other_tmp.close()
            os.unlink(other_tmp.name)

        if chunk_tmp_files:
            self.stdout.write(
                f'Loading {resource_usage_count} ResourceUsage records '
                f'in parallel with {num_workers} workers...'
            )

            total_inserted = 0

            with ProcessPoolExecutor(max_workers=num_workers) as executor:
                futures = {
                    executor.submit(_bulk_insert_from_file, tmp_path): idx
                    for idx, tmp_path in enumerate(chunk_tmp_files)
                }
                for future in as_completed(futures):
                    chunk_idx = futures[future]
                    try:
                        count = future.result()
                        total_inserted += count
                        self.stdout.write(f'  Worker chunk {chunk_idx + 1}/{len(chunk_tmp_files)} done: {count} records')
                    except Exception as exc:
                        self.stderr.write(self.style.ERROR(
                            f'  Worker chunk {chunk_idx + 1}/{len(chunk_tmp_files)} failed: {exc}'
                        ))

            for tmp_path in chunk_tmp_files:
                os.unlink(tmp_path)

            elapsed_usage = time.time() - start_time
            self.stdout.write(self.style.SUCCESS(
                f'Loaded {total_inserted} ResourceUsage records in {elapsed_usage:.1f}s'
            ))

            self._reset_sequence()

        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f'Done in {elapsed:.1f}s'))

    def _reset_sequence(self):
        """Reset the primary key sequence for backend_resourceusage after bulk insert."""
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval(pg_get_serial_sequence('backend_resourceusage', 'id'), "
                "COALESCE(MAX(id), 1)) FROM backend_resourceusage;"
            )
        self.stdout.write('Reset backend_resourceusage primary key sequence')
