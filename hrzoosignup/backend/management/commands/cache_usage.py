import logging

from backend import models
from backend.api.internal.view_accounting import usage4user, \
    usage4project_per_user, _is_user_lead
from backend.caching import entries, store
from django.core.management.base import BaseCommand

logger = logging.getLogger("hrzoosignup.crons")


class Command(BaseCommand):
    help = (
        "Creates per-user cache for entries in ResourceUsage model needed for "
        "graphs"
    )

    def handle(self, *args, **options):
        logger.info("Caching user data...")

        try:
            for user in models.User.objects.all().iterator():
                # Replace even empty results; compute each expensive value once.
                # Do not delete first: readers can use the old value while warming.
                store.set(entries.USER_USAGE, usage4user(user.username),
                          account=user.username)

                if _is_user_lead(user):
                    store.set(entries.PROJECT_USER_USAGE,
                              usage4project_per_user(user.username), account=user.username)
                else:
                    store.delete(entries.PROJECT_USER_USAGE, account=user.username)

                # ProjectUsage computes live data; retire its unused warm entry.
                store.delete(entries.LEGACY_PROJECT_USAGE, account=user.username)

        except Exception as e:
            logger.error(f"Error caching user data: {str(e)}")

        else:
            logger.info("Caching user data... DONE")
