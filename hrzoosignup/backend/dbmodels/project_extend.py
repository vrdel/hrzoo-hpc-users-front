from django.db import models
from django.utils.translation import gettext_lazy as _

from .project import Project


class ProjectExtend(models.Model):
    date = models.DateTimeField(
        _("Datetime when comment is added"),
        null=True,
        blank=True
    )
    approved = models.BooleanField()
    date_end = models.DateTimeField(
        _("New date_end of project"),
        null=True,
        blank=True
    )
    reason = models.CharField(
        _('reason'),
        max_length=4096,
    )
    project = models.ForeignKey(Project, null=True, on_delete=models.CASCADE)
