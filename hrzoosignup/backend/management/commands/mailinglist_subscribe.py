from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.core.cache import cache

import asyncio

from backend.httpq.httpconn import SessionWithRetry
from backend.httpq.excep import HZSIHttpError
from backend.tasks.mailinglist_subscribe import ListSubscribe


class Command(BaseCommand):
    help = "Subscribe eligible users to mailing list"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def handle(self, *args, **options):
        all_users = self.user_model.objects.all()

        users_to_subscribe = list()

        for user in all_users:
            if user.status == True and user.mailinglist_subscribe == False:
                users_to_subscribe.append(user)

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            list_subscribe = ListSubscribe(users_to_subscribe)
            loop.run_until_complete(list_subscribe.run())
            loop.close()

        except (HZSIHttpError, KeyboardInterrupt):
            pass
