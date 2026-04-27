import logging

from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.models import Project

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Invalidate cache if any approved project starts today"

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirmed_yes",
            help="Explicitly state to agree to make the changes",
        )
        parser.add_argument(
            "--cron",
            action="store_true",
            dest="cron",
            help="Flag indicating call from cron",
        )

    def handle(self, *args, **options):
        today = timezone.localdate()

        projects_starting_today = Project.objects.filter(
            date_start=today,
            state__name='approve'
        )

        count = projects_starting_today.count()

        if count > 0:
            identifiers = list(
                projects_starting_today.values_list('identifier', flat=True)
            )
            msg = (
                f"Found {count} project(s) starting today: "
                f"{', '.join(identifiers)}"
            )
            self.stdout.write(self.style.NOTICE(msg))
            if options.get('cron'):
                logger.info(msg)

            if options.get('confirmed_yes'):
                cache.delete("projects-get-all")
                cache.delete("ext-users-projects")
                cache.delete("usersinfo-get")
                cache.delete("usersinfoinactive-get")
                self.stdout.write(self.style.NOTICE("Cache invalidated"))
                if options.get('cron'):
                    logger.info("Cache invalidated")
            else:
                self.stdout.write(self.style.NOTICE(
                    "Cache would be invalidated (use --yes to confirm)"
                ))
        else:
            self.stdout.write(self.style.NOTICE("No projects starting today"))
            if options.get('cron'):
                logger.info("No projects starting today")
