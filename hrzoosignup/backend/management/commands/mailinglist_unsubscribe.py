import asyncio
import logging
import os

from backend.httpq.excep import HZSIHttpError
from backend.tasks.mailinglist import ListUnsubscribe
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Unsubscribe eligible users from mailing list"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirm_yes",
            help="Make changes",
        )
        parser.add_argument(
            "--cron",
            action="store_true",
            dest="cron",
            help="Flag indicating call from cron",
        )

    def handle(self, *args, **options):
        logger.info("Unsubscribing eligible users from mailing list...")

        all_users = self.user_model.objects.all()

        users_to_unsubscribe = list()
        # TODO: revert
        # for user in all_users:
            # if user.status == False and user.mailinglist_subscribe == True:
                # users_to_unsubscribe.append(user)

        users_to_unsubscribe.append(all_users.get(username='dvrcic@srce.hr'))

        if not options.get('confirm_yes', None):
            self.stdout.write(self.style.WARNING('List of users that will be unsubscribed'))
            for user in users_to_unsubscribe:
                self.stdout.write(self.style.WARNING(f'{user.username}'))
        else:
            try:
                list_subscribe = ListUnsubscribe(users_to_unsubscribe, cron=options.get('cron', None), django_stdout={'stdout': self.stdout, 'style': self.style})
                asyncio.run(list_subscribe.run())
                if users_to_unsubscribe:
                    logger.info(f'User to unsubscribe: {repr([user.username for user in users_to_unsubscribe])}')
                    logger.info(f'Details in {os.environ["VIRTUAL_ENV"]}/var/log/tasks.log ')
                else:
                    logger.info('No users to unsubscribe')

            except (HZSIHttpError, KeyboardInterrupt):
                pass

            logger.info("Unsubscribing eligible users to mailing list... DONE")
