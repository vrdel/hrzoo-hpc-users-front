from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError
from django.utils import timezone

import json

# based on django/contrib/auth/management/commands/createsuperuser.py

import datetime

class Command(BaseCommand):
    help = 'Transform croris_finance field as JSON array'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def handle(self, *args, **kwargs):
        from backend import models
        for project in models.Project.objects.all():
            if project.croris_finance:
                project.croris_finance = [project.croris_finance]
                project.save()
