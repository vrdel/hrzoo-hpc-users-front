import json
import os
import tempfile
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

import django
from django.core.management import call_command
from django.core.management.base import BaseCommand

RESOURCE_USAGE_MODEL = 'backend.resourceusage'


def _dump_chunk_to_file(offset, limit, tmp_path):
    """
    Worker function that runs in a separate process.
    Fetches a slice of ResourceUsage and writes it to a temp file.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrzoosignup.settings')
    django.setup()

    from backend.models import ResourceUsage
    from django.db import connections as worker_connections

    qs = ResourceUsage.objects.order_by('pk')[offset:offset + limit]
    count = 0

    with open(tmp_path, 'w') as f:
        f.write('[')
        first = True
        for obj in qs.iterator(chunk_size=5000):
            record = {
                'model': RESOURCE_USAGE_MODEL,
                'pk': obj.pk,
                'fields': {
                    'user': obj.user_id,
                    'project': obj.project_id,
                    'resource_name': obj.resource_name,
                    'end_time': obj.end_time.isoformat() if obj.end_time else None,
                    'accounting_record': obj.accounting_record,
                }
            }
            if not first:
                f.write(',')
            json.dump(record, f, ensure_ascii=False)
            first = False
            count += 1
        f.write(']')

    for conn in worker_connections.all():
        conn.close()

    return count


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
        chunk_tmp_files = []
        total_usage_count = 0

        if not skip_usage:
            from backend.models import ResourceUsage
            total_count = ResourceUsage.objects.count()
            self.stdout.write(
                f'Dumping {total_count} ResourceUsage records '
                f'in parallel with {num_workers} workers...'
            )

            if total_count > 0:
                chunk_size = total_count // num_workers
                if chunk_size == 0:
                    chunk_size = total_count

                offsets = list(range(0, total_count, chunk_size))

                for idx in range(len(offsets)):
                    tmp = tempfile.NamedTemporaryFile(
                        delete=False, suffix='.json', prefix=f'fastdump_chunk{idx}_'
                    )
                    tmp.close()
                    chunk_tmp_files.append(tmp.name)

                with ProcessPoolExecutor(max_workers=num_workers) as executor:
                    futures = {
                        executor.submit(
                            _dump_chunk_to_file, offset, chunk_size, chunk_tmp_files[idx]
                        ): idx
                        for idx, offset in enumerate(offsets)
                    }
                    for future in as_completed(futures):
                        chunk_idx = futures[future]
                        try:
                            count = future.result()
                            total_usage_count += count
                            self.stdout.write(
                                f'  Worker chunk {chunk_idx + 1}/{len(offsets)} done: '
                                f'{count} records'
                            )
                        except Exception as exc:
                            self.stderr.write(self.style.ERROR(
                                f'  Worker chunk {chunk_idx + 1}/{len(offsets)} failed: {exc}'
                            ))

        self.stdout.write(f'Writing output to {output_path}...')
        with open(output_path, 'w') as out_f:
            out_f.write('[')

            if indent:
                for i, record in enumerate(other_records):
                    if i > 0:
                        out_f.write(',')
                    out_f.write('\n')
                    json.dump(record, out_f, indent=indent, ensure_ascii=False)
            else:
                for i, record in enumerate(other_records):
                    if i > 0:
                        out_f.write(',')
                    json.dump(record, out_f, ensure_ascii=False)

            has_other = len(other_records) > 0

            for tmp_path in chunk_tmp_files:
                with open(tmp_path, 'r') as chunk_f:
                    content = chunk_f.read().strip()
                    if content == '[]':
                        continue
                    inner = content[1:-1]
                    if has_other:
                        out_f.write(',')
                    out_f.write(inner)
                    has_other = True
                os.unlink(tmp_path)

            out_f.write(']')

        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(
            f'Done: {len(other_records)} other + {total_usage_count} ResourceUsage '
            f'records in {elapsed:.1f}s'
        ))
