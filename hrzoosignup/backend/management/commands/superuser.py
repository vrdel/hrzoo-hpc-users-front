from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError

# based on django/contrib/auth/management/commands/createsuperuser.py


class Command(BaseCommand):
    help = 'Used to create a superuser.'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def handle(self, *args, **kwargs):
        user_data = dict()

        user_data[self.user_model.USERNAME_FIELD] = settings.SUPERUSER_NAME
        user_data['first_name'] = settings.SUPERUSER_NAME
        user_data['last_name'] = settings.SUPERUSER_NAME
        user_data['password'] = settings.SUPERUSER_PASS
        user_data['email'] = settings.SUPERUSER_EMAIL

        try:
            user = self.user_model._default_manager.db_manager(DEFAULT_DB_ALIAS).create_superuser(**user_data)
            user.aaieduhr = None
            user.institution = 'SRCE'
            user.role = 'Superuser'
            user.save()
            self.stdout.write("Superuser created successfully.")
        except IntegrityError:
            self.stderr.write("Superuser already created.")
