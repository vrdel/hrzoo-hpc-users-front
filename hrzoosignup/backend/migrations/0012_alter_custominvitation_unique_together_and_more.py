# Generated by Django 4.2 on 2023-04-17 17:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0011_custominvitation_person_oib'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='custominvitation',
            unique_together={('project', 'email')},
        ),
        migrations.RemoveField(
            model_name='custominvitation',
            name='person_oib',
        ),
    ]
