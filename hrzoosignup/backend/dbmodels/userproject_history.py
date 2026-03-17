from django.db import models

from .project import Project
from .user import User


class UserProjectHistory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    role = models.CharField(max_length=30)
    date_joined = models.DateTimeField(null=True, blank=True)
    date_left = models.DateTimeField()
    removed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='removed_userprojects'
    )
    user_username = models.CharField(max_length=128, blank=True)
    user_first_name = models.CharField(max_length=128, blank=True)
    user_last_name = models.CharField(max_length=128, blank=True)
    user_mail = models.EmailField(blank=True)
    project_name = models.CharField(max_length=512, blank=True)
    project_identifier = models.CharField(max_length=128, blank=True)
