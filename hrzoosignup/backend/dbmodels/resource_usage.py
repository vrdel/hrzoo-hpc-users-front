from django.db import models

from .user import User
from .project import Project


class ResourceUsage(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    resource_name = models.CharField(max_length=128, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    accounting_record = models.JSONField(blank=True, null=True)
