import logging

from backend import models
from django.core.management.base import BaseCommand

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = 'Reset request count each months that is used for project identifier create'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def handle(self, *args, **kwargs):
        logger.info("Resetting request count...")
        pc = models.ProjectCount.objects.get(pk=1)
        pc.counter = 1
        pc.save()
        logger.info("Resetting request count... DONE")
