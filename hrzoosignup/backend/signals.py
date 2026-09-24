from .models import UserProject
from backend import cache_invalidation
from backend.utils.gen_username import gen_username
from django.conf import settings
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger('hrzoosignup.tasks')


def generate_username(sender, instance, created, **kwargs):
    if kwargs['raw']:
        return

    if not instance.user.person_username and instance.project.state.name == 'approve':
        new_username = gen_username(instance.user.first_name, instance.user.last_name)
        instance.user.person_username = new_username
        logger.info(f"Generated username {new_username} for {instance.user.username}")
        instance.user.save()
        cache_invalidation.user_changed()


# post_save.connect(generate_username, sender=UserProject)


@receiver(post_save, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_saved')
@receiver(post_delete, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_deleted')
def invalidate_user_responses(sender, instance, **kwargs):
    # Includes staff command/admin edits and authentication profile updates.
    cache_invalidation.user_changed()
