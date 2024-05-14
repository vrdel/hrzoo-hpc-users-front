from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError
from django.utils import timezone

# based on django/contrib/auth/management/commands/createsuperuser.py

import datetime

class Command(BaseCommand):
    help = 'Count projects HrZZ projects and users'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def handle(self, *args, **kwargs):
        from backend import models

        target_projects, target_projects_ids = list(), set()
        target_users = set()

        for project in models.Project.objects.all():
            if project.croris_finance and 'zaklada' in project.croris_finance[0]:
                target_projects.append(project)
                target_projects_ids.update([project.identifier])

        self.stdout.write(f'Number of HrZZ projects {len(target_projects)}')
        for up in models.UserProject.objects.all():
            if up.project.identifier in target_projects_ids:
                target_users.update([up.user.person_username])

        self.stdout.write(f'Number of users on HrZZ projects {len(target_users)}')

