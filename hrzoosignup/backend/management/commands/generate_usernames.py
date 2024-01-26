from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.core.cache import cache
from backend.utils.gen_username import gen_username
from backend.models import UserProject

import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "Generate username for users that assigned to project"

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
        user_ids_assigned = UserProject.objects.all().values_list('user__id', flat=True)
        any_changed = False

        for user in all_users:
            if not user.person_username and user.id in user_ids_assigned:
                if options.get('confirmed_yes', None):
                    new_username = gen_username(user.first_name, user.last_name)
                    self.stdout.write(self.style.NOTICE(f'Generated username {new_username} for {user.username}'))

                    user.person_username = new_username
                    any_changed = True
                    user.save()
                else:
                    self.stdout.write(f'Username {new_username} would be generated for {user.username}')

        if any_changed:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write('No changes')

