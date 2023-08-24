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

    def handle(self, *args, **options):
        if options['create']:
            name, key = APIKey.objects.create_key(name=options['create'])
            self.stdout.write(self.style.SUCCESS(f"API Key created"))
            self.stdout.write('Name of the key: ' + self.style.WARNING(f'{name}'))
            self.stdout.write('Value of key: ' + self.style.WARNING(f'{key}') + ' (visible only on creation time)')

