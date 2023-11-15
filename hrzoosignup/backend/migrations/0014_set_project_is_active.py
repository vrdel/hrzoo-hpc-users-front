# manually created
# Wed Nov 15 03:17:58 PM CET 2023

from django.db import migrations, models


def set_isactive(apps, schema_editor):
    Project = apps.get_model('backend', 'Project')
    for project in Project.objects.all():
        if project.state.name != 'approve' and project.state.name != 'extend':
            project.is_active = False
        project.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_alter_user_croris_mbz'),
    ]

    operations = [
        migrations.RunPython(set_isactive)
    ]
