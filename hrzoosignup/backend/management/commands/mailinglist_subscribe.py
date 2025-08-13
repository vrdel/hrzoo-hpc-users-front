import asyncio
import logging
import os

from backend.httpq.excep import HZSIHttpError
from backend.tasks.mailinglist import ListSubscribe
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Subscribe eligible users to mailing list"

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
        all_users = self.user_model.objects.all()
        users_to_subscribe = list()
        # TODO: revert
        # for user in all_users:
            # if user.status == True and user.mailinglist_subscribe == False:
                # users_to_subscribe.append(user)

        users_to_subscribe.append(all_users.get(username='dvrcic@srce.hr'))

        if not options.get('confirm_yes', None):
            self.stdout.write(self.style.WARNING('List of users that will be subscribed'))
            for user in users_to_subscribe:
                self.stdout.write(self.style.WARNING(f'{user.username}'))
        else:
            try:

                list_subscribe = ListSubscribe(users_to_subscribe, options.get('cron', None))
                ret_msg = asyncio.run(list_subscribe.run())
                if users_to_subscribe and ret_msg:
                    self.stdout.write(self.style.SUCCESS(ret_msg))
                    if options.get('cron', None):
                        logger.info(ret_msg)
                else:
                    self.stdout.write(self.style.SUCCESS('No users to subscribe'))

            except (HZSIHttpError, KeyboardInterrupt) as exc:
                self.stdout.write(self.style.ERROR(exc))
                if options.get('cron', None):
                    logger.error(exc)
