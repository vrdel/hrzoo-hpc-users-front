import logging

from backend import models
from backend.api.internal.view_accounting import usage4user, \
    usage4project_per_user, _is_user_lead, usage4project
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
            users = [
                user for user in models.User.objects.all().values_list(
                    "person_username", flat=True
                ) if user
            ]

            cache.delete_many(users)

            cache.set_many({
                f"usage_{user}": usage4user(user) for user in users
                if usage4user(user)
            }, timeout=None)

            cache.set_many({
                f"project_usage_{user}": usage4project(user) for user in users
                if (_is_user_lead(models.User.objects.get(person_username=user))
                    and usage4project(user))
            })

            cache.set_many({
                f"project_user_usage_{user}": usage4project_per_user(user)
                for user in users
                if (_is_user_lead(models.User.objects.get(person_username=user))
                    and usage4project_per_user(user))
            })

        except Exception as e:
            logger.error(f"Error caching user data: {str(e)}")

        else:
            logger.info("Caching user data... DONE")
