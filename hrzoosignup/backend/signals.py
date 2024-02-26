from .models import UserProject
from backend.utils.gen_username import gen_username
from django.core.cache import cache
from django.db.models.signals import post_save
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
        cache.delete("ext-users-projects")
        cache.delete("usersinfoinactive-get")
        cache.delete("usersinfo-get")


# post_save.connect(generate_username, sender=UserProject)
