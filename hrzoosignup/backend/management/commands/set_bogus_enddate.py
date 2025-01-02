from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError
from django.utils import timezone

import datetime


class Command(BaseCommand):
    help = 'Set bogus_end date for projects that should be closed by now'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirm_yes",
            help="Make changes",
        )

    def handle(self, *args, **kwargs):
        any_changed = False
        from backend import models

        for project in models.Project.objects.all():
            if project.state.name in ["expire", "submit", "deny"]:
                continue
            date_now = timezone.make_aware(datetime.datetime.now()).date()
            if project.date_end < date_now:
                self.stdout.write(self.style.NOTICE('Outdated active project {} with date_end {}'.format(project.identifier, project.date_end)))
