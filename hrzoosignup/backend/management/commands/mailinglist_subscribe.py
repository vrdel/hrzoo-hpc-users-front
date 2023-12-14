from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.conf import settings
from django.core.cache import cache


from backend.httpq.httpconn import SessionWithRetry
from backend.httpq.excep import HZSIHttpError


class Command(BaseCommand):
    help = "Subscribe eligible users to mailing list"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def handle(self, *args, **options):
        all_users = self.user_model.objects.all()

        for user in all_users:
            if user.status and not user.mailinglist_subscribe:
                self.stdout.write(self.style.SUCCESS(f'Subscribing user {user.username} to mailing list'))
