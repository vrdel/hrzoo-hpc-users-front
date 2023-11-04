# manually created
# Sat Nov  4 11:33:45 PM CET 2023

from django.db import migrations, models


def set_date_approved(apps, schema_editor):
    Project = apps.get_model('backend', 'Project')
    for project in Project.objects.all():
        project.date_approved = project.date_changed
        project.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_project_date_approved'),
    ]

    operations = [
        migrations.RunPython(set_date_approved)
    ]
