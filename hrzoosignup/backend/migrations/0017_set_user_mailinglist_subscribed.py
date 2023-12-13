# manually created
# Wed Nov 15 03:17:58 PM CET 2023

from django.db import migrations, models
from django.contrib.auth import get_user_model


# previously, if user added his public key,
# he would have been subscribed from cluster
# side so those are for sure already subscribed
def set_subscribed(apps, schema_editor):
    User = get_user_model()
    for user in User.objects.all():
        if user.sshpublickey_set.count():
            user.mailinglist_subscribe = True
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0016_user_mailinglist_subscribe'),
    ]

    operations = [
        migrations.RunPython(set_subscribed)
    ]
