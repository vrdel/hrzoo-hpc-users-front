import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0037_unique_together_to_constraints'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProjectHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(max_length=30)),
                ('date_joined', models.DateTimeField(blank=True, null=True)),
                ('date_left', models.DateTimeField()),
                ('user_username', models.CharField(blank=True, max_length=128)),
                ('user_first_name', models.CharField(blank=True, max_length=128)),
                ('user_last_name', models.CharField(blank=True, max_length=128)),
                ('user_mail', models.EmailField(blank=True, max_length=254)),
                ('project_name', models.CharField(blank=True, max_length=512)),
                ('project_identifier', models.CharField(blank=True, max_length=128)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='backend.project')),
                ('removed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='removed_userprojects', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
