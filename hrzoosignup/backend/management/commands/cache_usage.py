import logging

from backend import models
from backend.api.internal.view_accounting import usage4user, \
    usage4project_per_user, _is_user_lead
from backend.usage_cache import project_user_usage_key, user_usage_key
from django.core.cache import cache
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
                cache.set(user_usage_key(user.username),
                          usage4user(user.username), timeout=None)

                if _is_user_lead(user):
                    cache.set(project_user_usage_key(user.username),
                              usage4project_per_user(user.username))
                else:
                    cache.delete(project_user_usage_key(user.username))

                # ProjectUsage computes live data; retire its unused warm entry.
                cache.delete(f"project_usage_{user.username}")

        except Exception as e:
            logger.error(f"Error caching user data: {str(e)}")

        else:
            logger.info("Caching user data... DONE")
