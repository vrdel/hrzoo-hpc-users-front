# Generated by Django 4.2.11 on 2024-06-09 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0022_custominvitation_invtype_user_person_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='person_type_manual_set',
            field=models.BooleanField(default=False),
        ),
    ]
