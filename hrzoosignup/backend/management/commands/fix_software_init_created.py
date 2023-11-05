import datetime

from backend import models

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Populate initial software created time and added by'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def handle(self, *args, **kwargs):
        for software in models.ScienceSoftware.objects.all():
            software.created = datetime.datetime(2023, 4, 20, 12, 0, 0, tzinfo=timezone.get_current_timezone())
            software.added_by = {
                'username': 'initial',
                'first_name': 'Initial',
                'last_name': 'set'
            }
            software.save()
