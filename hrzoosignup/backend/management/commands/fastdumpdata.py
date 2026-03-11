import json
import os
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

import django
from django.core.management import call_command
from django.core.management.base import BaseCommand

RESOURCE_USAGE_MODEL = 'backend.resourceusage'
RESOURCE_USAGE_APP_LABEL = 'backend'
RESOURCE_USAGE_MODEL_NAME = 'resourceusage'


def _dump_chunk(offset, limit, db_settings):
    """
    Worker function that runs in a separate process.
    Fetches a slice of ResourceUsage and returns serialized entries.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrzoosignup.settings')
    django.setup()

    from backend.models import ResourceUsage
    from django.db import connections as worker_connections

    qs = ResourceUsage.objects.order_by('pk')[offset:offset + limit]
    records = []
    for obj in qs.iterator(chunk_size=5000):
        records.append({
            'model': RESOURCE_USAGE_MODEL,
            'pk': obj.pk,
            'fields': {
                'user': obj.user_id,
                'project': obj.project_id,
                'resource_name': obj.resource_name,
                'end_time': obj.end_time.isoformat() if obj.end_time else None,
                'accounting_record': obj.accounting_record,
            }
        })

    for conn in worker_connections.all():
        conn.close()

    return records


class Command(BaseCommand):
    help = "Dump data like dumpdata but export backend_resourceusage in parallel"

    def add_arguments(self, parser):
        parser.add_argument('output', type=str, help='Path to the output JSON file')
        parser.add_argument('--workers', dest='workers', type=int, default=4,
                            help='Number of parallel workers for resource usage export (default: 4)')
        parser.add_argument('--exclude', dest='exclude', action='append', default=[],
                            help='App or app.Model to exclude (can be used multiple times)')
        parser.add_argument('--indent', dest='indent', type=int, default=None,
                            help='JSON indentation level')

    def handle(self, *args, **options):
        output_path = options['output']
        num_workers = options['workers']
        indent = options['indent']
        excludes = list(options['exclude'])

        excludes_with_usage = excludes + [RESOURCE_USAGE_MODEL]

        self.stdout.write('Dumping non-ResourceUsage data with dumpdata...')
        start_time = time.time()

        from io import StringIO
        out = StringIO()
        call_command(
            'dumpdata',
            '--natural-foreign',
            '--exclude', *excludes_with_usage,
            stdout=out,
            verbosity=options['verbosity'],
        )
        other_records = json.loads(out.getvalue())
        self.stdout.write(f'  Dumped {len(other_records)} non-ResourceUsage records')

        skip_usage = RESOURCE_USAGE_MODEL in excludes
        resource_usage_records = []

        if not skip_usage:
            self.stdout.write(
                f'Dumping ResourceUsage records in parallel with {num_workers} workers...'
            )

            from backend.models import ResourceUsage
            total_count = ResourceUsage.objects.count()
            self.stdout.write(f'  Total ResourceUsage records: {total_count}')

            if total_count > 0:
                chunk_size = total_count // num_workers
                if chunk_size == 0:
                    chunk_size = total_count

                offsets = list(range(0, total_count, chunk_size))

                from django.conf import settings
                db_settings = settings.DATABASES['default']

                with ProcessPoolExecutor(max_workers=num_workers) as executor:
                    futures = {
                        executor.submit(_dump_chunk, offset, chunk_size, db_settings): idx
                        for idx, offset in enumerate(offsets)
                    }
                    for future in as_completed(futures):
                        chunk_idx = futures[future]
                        try:
                            chunk_records = future.result()
                            resource_usage_records.extend(chunk_records)
                            self.stdout.write(
                                f'  Worker chunk {chunk_idx + 1}/{len(offsets)} done: '
                                f'{len(chunk_records)} records'
                            )
                        except Exception as exc:
                            self.stderr.write(self.style.ERROR(
                                f'  Worker chunk {chunk_idx + 1}/{len(offsets)} failed: {exc}'
                            ))

        all_records = other_records + resource_usage_records

        self.stdout.write(f'Writing {len(all_records)} total records to {output_path}...')
        with open(output_path, 'w') as f:
            json.dump(all_records, f, indent=indent, ensure_ascii=False)

        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(
            f'Done: {len(other_records)} other + {len(resource_usage_records)} ResourceUsage '
            f'records in {elapsed:.1f}s'
        ))
