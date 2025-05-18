from django.db import models
from django.utils.translation import gettext_lazy as _

from .user import User


class ProjectCount(models.Model):
    counter = models.IntegerField(null=True)


class State(models.Model):
    name = models.CharField(
        _("Project state"),
        max_length=24,
        blank=True,
    )


class ProjectType(models.Model):
    name = models.CharField(
        _("Project type"),
        max_length=24,
        blank=True,
    )


class Project(models.Model):
    identifier = models.CharField(
        _('identifier'),
        max_length=32,
        unique=True
    )
    name = models.CharField(
        _('name'),
        max_length=256,
    )
    institute = models.CharField(
        _('institution of project leader'),
        max_length=128,
        blank=True,
    )
    reason = models.CharField(
        _('reason'),
        max_length=4096,
    )
    date_approved = models.DateTimeField(
        null=True,
        blank=True,
    )
    date_start = models.DateField(
        null=True,
        blank=True,
    )
    date_end = models.DateField(
        null=True,
        blank=True,
    )
    bogus_end = models.DateField(
        null=True,
        blank=True,
    )
    date_submitted = models.DateTimeField(
        null=True,
        blank=True,
    )
    date_changed = models.DateTimeField(
        null=True,
        blank=True,
    )
    approved_by = models.JSONField(
        _("JSONField with few details of staff that approved request"),
        blank=True,
        null=True
    )
    denied_by = models.JSONField(
        _("JSONField with few details of staff that denied request"),
        blank=True,
        null=True
    )
    changed_by = models.JSONField(
        _("JSONField with few details of staff that last changed request"),
        blank=True,
        null=True
    )
    change_history = models.JSONField(
        _("JSONField with previous and new field values of requests and additional metadata of change"),
        blank=True,
        null=True
    )
    science_field = models.JSONField(
        blank=True,
        null=True
    )
    science_software = models.JSONField(
        blank=True,
        null=True
    )
    science_extrasoftware = models.CharField(
        _("Extra software needed on project"),
        max_length=256,
        blank=True,
    )
    science_extrasoftware_help = models.BooleanField()
    resources_numbers = models.JSONField(
        blank=True,
        null=True
    )
    resources_type = models.JSONField(
        blank=True,
        null=True
    )
    is_active = models.BooleanField()
    croris_title = models.CharField(
        _("CroRIS title"),
        max_length=512,
        blank=True,
    )
    croris_start = models.DateField(
        null=True,
        blank=True,
    )
    croris_end = models.DateField(
        null=True,
        blank=True,
    )
    croris_identifier = models.CharField(
        _("CroRIS hrSifraProjekta"),
        max_length=48,
        blank=True,
    )
    croris_id = models.PositiveBigIntegerField(
        _("CroRIS id"),
        null=True
    )
    croris_summary = models.CharField(
        _("CroRIS summary"),
        max_length=8192,
        blank=True,
    )
    croris_collaborators = models.JSONField(
        _("CroRIS osobeResources -voditelj"),
        blank=True,
        null=True
    )
    croris_lead = models.JSONField(
        _("CroRIS osobeResources voditelj"),
        blank=True,
        null=True
    )
    croris_finance = models.JSONField(
        _("CroRIS financijeri entityNameHr"),
        max_length=256,
        blank=True,
        null=True
    )
    croris_institute = models.JSONField(
        _('CroRIS institute'),
        max_length=512,
        blank=True,
        null=True
    )
    croris_type = models.CharField(
        _("CroRIS tipProjekta"),
        max_length=128,
        blank=True,
    )
    staff_resources_type = models.JSONField(
        blank=True,
        null=True
    )
    state = models.ForeignKey(State, null=True, on_delete=models.CASCADE)
    users = models.ManyToManyField(User, through='UserProject')
    project_type = models.ForeignKey(ProjectType, null=True, on_delete=models.CASCADE)


class StaffComment(models.Model):
    comment = models.CharField(
        _("Staff comment on managing request"),
        blank=True,
        null=True,
        max_length=4096,
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
    project_state = models.CharField(
        _("Project state when the comment was made"),
        max_length=24,
        blank=True,
    )
    project = models.ForeignKey(Project, null=True, on_delete=models.CASCADE)
