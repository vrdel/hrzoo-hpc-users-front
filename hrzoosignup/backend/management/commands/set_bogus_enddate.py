import datetime
import logging

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

logger = logging.getLogger("hrzoosignup.crons")


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
        parser.add_argument(
            "--expired",
            action="store_true",
            dest="expired",
            help="bogus_end set for expired projects",
        )

    def handle(self, *args, **options):
        logger.info("Setting bogus_end date...")
        any_changed = False
        from backend import models
        outdated = 0
        refresh = 0
        expired = 0
        expired_bogus = 0

        for project in models.Project.objects.all():
            if project.state.name in ["expire", "submit", "deny"]:
                continue
            date_now = timezone.make_aware(datetime.datetime.now()).date()
            if project.date_end < date_now:
                outdated += 1
                if not project.bogus_end:
                    logger.warning('Outdated active project {} with date_end {} without bogus_end set'.format(project.identifier, project.date_end))
                if options.get('confirm_yes', None) and not project.bogus_end:
                    logger.info(f'Set bogus_enddate={date_now} for project {project.identifier}')
                    any_changed = True
                    project.bogus_end = date_now
                if options.get('confirm_yes', None) and project.bogus_end and project.bogus_end != date_now:
                    project.bogus_end = date_now
                    any_changed = True
                    refresh += 1
                if any_changed:
                    project.save()
        logger.info(f'Found {outdated} outdated but still active projects')
        if refresh:
            logger.info(f'Refreshed bogus_end field for {refresh} outdated but still active projects')

        any_changed = False
        if options.get('expired', None):
            for project in models.Project.objects.all():
                if project.state.name == "expire" and project.change_history:
                    last_change = project.change_history[-1]
                    if last_change['previous']['state'] != last_change['next']['state']:
                        expired += 1
                        if options.get('confirm_yes', None):
                            date_changed = project.date_changed.date()
                            if project.bogus_end != date_changed:
                                project.bogus_end = date_changed
                                any_changed += True
                                logger.info(f'Set bogus_end={project.bogus_end} to date of last change for expired project {project.identifier} and official date_end={project.date_end}')
                                project.save()
                                expired_bogus += 1
        if expired:
            logger.info(f'Found {expired} projects whose status is changed after official date_end')
            if expired_bogus:
                logger.info(f'Set bogus_end for {expired_bogus} such projects')

        logger.info("Setting bogus_end date... DONE")
