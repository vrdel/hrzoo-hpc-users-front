from django.db.models.signals import post_save
from .models import UserProject


def generate_username(sender, instance, created, **kwargs):

    if kwargs['raw']:
        return


post_save.connect(generate_username, sender=UserProject)
