from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime


class Command(BaseCommand):
    help = 'Fix empty project date_approved by setting it to date_submitted'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def handle(self, *args, **kwargs):
        from backend import models
        for project in models.Project.objects.all():
            if not project.date_approved and project.approved_by:
                project.date_approved = project.date_submitted
                project.save()
