from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.conf import settings
from django.core.cache import cache

import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "Set user's newly introduced person_type value"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirmed_yes",
            help="Explicity state to agree to make the changes",
        )

    def handle(self, *args, **options):
        all_users = self.user_model.objects.all()

        any_changed = False

        for user in all_users:
            if user.person_type:
                self.stdout.write(f'User {user.username} skipped')
                continue
            elif not user.person_type:
                if options.get('confirmed_yes', None):
                    self.stdout.write(self.style.NOTICE(f'Setting {user.username} person_type=local'))
                    user.person_type = 'local'
                    any_changed = True
                    user.save()
                else:
                    self.stdout.write(f'User {user.username} would be set person_type=local ')

        if any_changed:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')
