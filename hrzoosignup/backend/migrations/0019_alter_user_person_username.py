# Generated by Django 4.2.3 on 2024-01-26 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0018_user_person_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='person_username',
            field=models.CharField(blank=True, max_length=10, verbose_name='Username - LDAP'),
        ),
    ]
