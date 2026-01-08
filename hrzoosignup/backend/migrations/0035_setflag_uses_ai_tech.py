# Thu Jan  8 01:03:37 PM CET 2026
# manually created
# -vrdel

from django.db import migrations, models


def set_uses_ai_tech(apps, schema_editor):
    Project = apps.get_model('backend', 'Project')
    for project in Project.objects.all():
        project.uses_ai_tech = False
        project.save()


class Migration(migrations.Migration):
    dependencies = [
        ('backend', '0034_project_uses_ai_tech'),
    ]

    operations = [
        migrations.RunPython(set_uses_ai_tech)
    ]
