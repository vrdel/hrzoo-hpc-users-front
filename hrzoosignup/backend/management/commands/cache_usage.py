import logging
from time import monotonic

from backend import models
from backend.api.internal.view_accounting import usage4user, usage4leader
from backend.caching import entries, store
from django.core.management.base import BaseCommand
from django.db.models import Exists, OuterRef

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = (
        "Creates per-user cache for entries in ResourceUsage model needed for "
        "graphs"
    )

    def handle(self, *args, **options):
        logger.info("Caching user data...")
        started = monotonic()
        user_count = leader_count = 0

        try:
            leadership = models.UserProject.objects.filter(
                user_id=OuterRef('pk'), role__name='lead')
            users = models.User.objects.only('username').annotate(
                usage_lead=Exists(leadership))
            for user in users.iterator():
                # Replace even empty results; compute each expensive value once.
                # Do not delete first: readers can use the old value while warming.
                store.set(entries.USER_USAGE, usage4user(user.username),
                          account=user.username)

                if user.usage_lead:
                    per_user, totals = usage4leader(user.username)
                    store.set(entries.PROJECT_USER_USAGE, per_user, account=user.username)
                    store.set(entries.PROJECT_USAGE, totals, account=user.username)
                    leader_count += 1
                else:
                    store.delete(entries.PROJECT_USER_USAGE, account=user.username)
                    store.delete(entries.PROJECT_USAGE, account=user.username)

                # Remove the retired project-usage key.
                store.delete(entries.LEGACY_PROJECT_USAGE, account=user.username)
                user_count += 1

        except Exception as e:
            logger.error(f"Error caching user data: {str(e)}")

        else:
            logger.info("Caching user data... DONE users=%d leaders=%d seconds=%.3f",
                        user_count, leader_count, monotonic() - started)
