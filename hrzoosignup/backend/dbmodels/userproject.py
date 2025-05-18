from django.db import models

from .project import Project
from .user import User, Role


class UserProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    date_joined = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = ['user', 'project', 'role']
