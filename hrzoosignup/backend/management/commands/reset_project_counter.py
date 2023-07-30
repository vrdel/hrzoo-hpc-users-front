import datetime

from backend import models

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Reset request count each months that is used for project identifier create'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def handle(self, *args, **kwargs):
        pc = models.ProjectCount.objects.get(pk=1)
        pc.counter = 1
        pc.save()
