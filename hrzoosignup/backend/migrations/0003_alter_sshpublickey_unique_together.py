# Generated by Django 4.2 on 2023-04-22 11:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_alter_sshpublickey_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='sshpublickey',
            unique_together={('user', 'fingerprint')},
        ),
    ]
