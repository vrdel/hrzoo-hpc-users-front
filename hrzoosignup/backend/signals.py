from django.db.models.signals import post_save
from .models import UserProject
from backend.utils.gen_username import gen_username


def generate_username(sender, instance, created, **kwargs):
    if kwargs['raw']:
        return

    if not instance.user.person_username:
        new_username = gen_username(instance.user.first_name, instance.user.last_name)
        instance.user.person_username = new_username
        instance.user.save()


post_save.connect(generate_username, sender=UserProject)
