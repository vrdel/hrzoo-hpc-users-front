from django.db import models
from django.utils.translation import gettext_lazy as _

from .project import Project


class DateExtend(models.Model):
    comment = models.CharField(
        _("Staff comment on managing request"),
        blank=True,
        null=True
    )
    date = models.DateTimeField(
        _("Datetime when comment is added"),
        null=True,
        blank=True
    )
    comment_by = models.JSONField(
        _("JSONField with few details of staff that made comment"),
        blank=True,
        null=True
    )
    name = models.CharField(
        _("Project state when the comment was made"),
        max_length=24,
        blank=True,
    )
    project = models.ForeignKey(Project, null=True, on_delete=models.CASCADE)
