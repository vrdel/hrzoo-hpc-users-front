from django.db import models
from django.utils.translation import gettext_lazy as _

from .project import Project


class ProjectExtend(models.Model):
    date = models.DateTimeField(
        _("Datetime when extension request is submitted"),
        null=True,
        blank=True
    )
    approved = models.BooleanField()
    date_end = models.DateField(
        _("New date_end of project"),
        null=True,
        blank=True
    )
    reason = models.CharField(
        _('reason'),
        max_length=4096,
    )
    date_approved = models.DateTimeField(
        null=True,
        blank=True,
    )
    approved_by = models.JSONField(
        _("JSONField with few details of staff that approved request"),
        blank=True,
        null=True
    )
    project = models.ForeignKey(Project, null=True, on_delete=models.CASCADE)
