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

    def handle(self, *args, **options):
        any_changed = False
        from backend import models
        outdated = 0
        refresh = 0

        for project in models.Project.objects.all():
            if project.state.name in ["expire", "submit", "deny"]:
                continue
            date_now = timezone.make_aware(datetime.datetime.now()).date()
            if project.date_end < date_now:
                outdated += 1
                if not project.bogus_end:
                    self.stdout.write(self.style.WARNING('Outdated active project {} with date_end {} without bogus_end set'.format(project.identifier, project.date_end)))
                if options.get('confirm_yes', None) and not project.bogus_end:
                    self.stdout.write(self.style.NOTICE(f'Set bogus_enddate={date_now} for project {project.identifier}'))
                    any_changed = True
                    project.bogus_end = date_now
                if options.get('confirm_yes', None) and project.bogus_end and project.bogus_end != date_now:
                    project.bogus_end = date_now
                    any_changed = True
                    refresh += 1
                if any_changed:
                    project.save()
        self.stdout.write(f'Found {outdated} outdated but still active projects')
        if refresh:
            self.stdout.write(f'Refreshed bogus_end field for {refresh} outdated but still active projects')
