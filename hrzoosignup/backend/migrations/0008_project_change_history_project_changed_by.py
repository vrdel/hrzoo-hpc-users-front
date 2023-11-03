# Generated by Django 4.2.3 on 2023-11-03 16:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0007_sciencesoftware_added_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='change_history',
            field=models.JSONField(blank=True, null=True, verbose_name='JSONField with previous and new field values of requests and additional metadata of change'),
        ),
        migrations.AddField(
            model_name='project',
            name='changed_by',
            field=models.JSONField(blank=True, null=True, verbose_name='JSONField with few details of staff that last changed request'),
        ),
    ]