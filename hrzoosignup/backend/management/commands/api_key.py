from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError

# based on django/contrib/auth/management/commands/createsuperuser.py

from rest_framework_api_key.models import APIKey


class Command(BaseCommand):
    help = 'Create, list and delete API Keys to be used in REST clients'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def add_arguments(self, parser):
        parser.add_argument(
            '--create',
            metavar='<name>',
            type=str,
            help='Create a new API Key with <name>'
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all created API keys'
        )

        parser.add_argument(
            '--delete',
            metavar='<prefix>',
            help='Delete API keys with <prefix>'
        )

    def handle(self, *args, **options):
        if options['create']:
            name, key = APIKey.objects.create_key(name=options['create'])
            self.stdout.write(self.style.SUCCESS(f"API Key created"))
            self.stdout.write('Name of the key: ' + self.style.WARNING(f'{name}'))
            self.stdout.write('Value of key: ' + self.style.WARNING(f'{key}') + ' (visible only on creation time)')

        if options['list']:
            api_keys = APIKey.objects.get_usable_keys()
            for key in api_keys:
                self.stdout.write('Name: ' + self.style.WARNING(f'{key.name}'))
                self.stdout.write('Prefix: ' + self.style.WARNING(f'{key.prefix}'))
                self.stdout.write('Created: ' + self.style.WARNING(f"{key.created.strftime('%H:%M:%Sh %d.%m.%Y')}"))
                self.stdout.write('\n')

        if options['delete']:
            try:
                api_key = APIKey.objects.get(prefix=options['delete'])
                api_key.delete()
                self.stdout.write(self.style.SUCCESS(f'Key {api_key} successfully deleted'))
            except APIKey.DoesNotExist as exc:
                self.stderr.write(f"Problem deleting key {options['delete']}: {repr(exc)}")
                raise SystemExit(1)
