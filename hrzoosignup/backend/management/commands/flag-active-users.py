import logging

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.utils.gen_username import gen_username

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Flag users as active if they are assigned on any active project"

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
        parser.add_argument(
            "--cron",
            action="store_true",
            dest="cron",
            help="Flag indicating call from cron",
        )

    def handle(self, *args, **options):
        all_users = self.user_model.objects.all()

        any_changed = False

        for user in all_users:
            if user.is_staff or user.is_superuser:
                continue
            user_projects = user.project_set.all()
            any_active = any([
                project.state.name not in ('expire', 'deny', 'submit')
                for project in user_projects
            ])
            if any_active and user.status != True:
                if options.get('confirmed_yes', None):
                    self.stdout.write(self.style.NOTICE(f'Marking user {user.username} active'))
                    if options.get('cron', None):
                        logger.info(f'Marking user {user.username} active')
                    user.status = True
                    if not user.person_username:
                        user.person_username = gen_username(user.first_name, user.last_name)
                        self.stdout.write(self.style.NOTICE(
                            f'Generated person_username {user.person_username} for user {user.username}'
                        ))
                        if options.get('cron', None):
                            logger.info(
                                f'Generated person_username {user.person_username} for user {user.username}'
                            )
                    any_changed = True
                    user.save()
                else:
                    self.stdout.write(self.style.NOTICE(
                        f'User {user.username} would be marked as active'
                    ))

        if any_changed:
            cache.delete("usersinfoinactive-get")
            cache.delete("usersinfo-get")
            cache.delete("ext-users-projects")
            cache.delete('projects-get-all')
        else:
            self.stdout.write(self.style.NOTICE('No changes'))
