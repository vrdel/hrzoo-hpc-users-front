import logging

from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.models import Project

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = "Invalidate cache if any approved project starts today"

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
            logger.info(
                f"Found {count} project(s) starting today: "
                f"{', '.join(identifiers)}"
            )
            cache.delete("projects-get-all")
            cache.delete("ext-users-projects")
            cache.delete("usersinfo-get")
            cache.delete("usersinfoinactive-get")
            logger.info("Cache invalidated")
        else:
            logger.info("No projects starting today")
