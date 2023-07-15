from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError
from django.utils import timezone

# based on django/contrib/auth/management/commands/createsuperuser.py

import datetime

class Command(BaseCommand):
    help = 'Fix project date_start and date_end with + 1 day and hour=23, minute=59, second=59'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def handle(self, *args, **kwargs):
        from backend import models
        for project in models.Project.objects.all():
            project.date_start = project.date_start + datetime.timedelta(days=1)
            project.date_end = project.date_end + datetime.timedelta(days=1)
            if project.croris_start and project.croris_end:
                project.croris_start = project.croris_start + datetime.timedelta(days=1)
                project.croris_end = project.croris_end + datetime.timedelta(days=1)
            project.save()
