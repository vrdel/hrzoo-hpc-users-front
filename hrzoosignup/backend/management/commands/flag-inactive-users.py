from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.conf import settings
from django.core.cache import cache

import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "Flag users as inactive if they are not assigned on any active project"

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
            if user.is_staff or user.is_superuser:
                continue
            user_projects = user.project_set.all()
            all_inactive = all([
                project.state.name == 'expire'
                or project.state.name == 'deny'
                or project.state.name == 'submit'
                for project in user_projects
            ])
            if all_inactive and user.status != False:
                if options.get('confirmed_yes', None):
                    self.stdout.write(self.style.NOTICE(f'Marking user {user.username} inactive'))
                    user.status = False
                    any_changed = True
                    user.save()
                else:
                    self.stdout.write(f'User {user.username} would be marked as inactive')

        if any_changed:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')

