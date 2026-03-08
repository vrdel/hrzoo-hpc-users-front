import django.db.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0036_alter_project_uses_ai_tech'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='userproject',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='userproject',
            constraint=models.UniqueConstraint(
                fields=['user', 'project', 'role'],
                name='unique_user_project_role',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='sshpublickey',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='sshpublickey',
            constraint=models.UniqueConstraint(
                fields=['user', 'fingerprint'],
                name='unique_user_fingerprint',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='custominvitation',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='custominvitation',
            constraint=models.UniqueConstraint(
                fields=['project', 'email'],
                name='unique_project_email',
            ),
        ),
    ]
