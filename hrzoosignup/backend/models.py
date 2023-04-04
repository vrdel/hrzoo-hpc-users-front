from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


# Create your models here.

class User(AbstractUser):
    person_uniqueid = models.CharField(
        _('hrEduPersonUniqueID - LDAP'),
        max_length=128,
        blank=True,
        null=True,
    )
    person_institution = models.CharField(
        _('Institution - LDAP'),
        max_length=128,
        blank=True,
        null=True
    )
    person_affiliation = models.CharField(
        _('Affiliation - LDAP'),
        max_length=64,
        blank=True,
        null=True
    )
    person_mail = models.CharField(
        _('Email - LDAP'),
        max_length=64,
        blank=True,
        null=True
    )
    croris_first_name = models.CharField(
        _("CroRIS first name"),
        max_length=48,
        blank=True
    )
    croris_last_name = models.CharField(
        _("CroRIS last name"),
        max_length=48,
        blank=True
    )
    croris_mail = models.EmailField(
        _("CroRIS email address"),
        blank=True
    )


class State(models.Model):
    name =  models.CharField(
        _("Project state"),
        max_length=24,
        blank=True,
        null=True
    )


class Project(models.Model):
    name = models.CharField(
        _('name'),
        max_length=256,
    )
    reason = models.CharField(
        _('reason'),
        max_length=1024,
    )
    date_start = models.DateField(
        null=True,
        blank=True,
    )
    date_end  = models.DateField(
        null=True,
        blank=True,
    )
    date_submitted  = models.DateField(
        null=True,
        blank=True,
    )
    date_approved = models.DateField(
        null=True,
        blank=True,
    )
    approved_by = models.CharField(
        _("Approved by"),
        max_length=128,
        blank=True
    )
    denied_by = models.CharField(
        _("Approved by"),
        max_length=128,
        blank=True
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
        null=True
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
    date_extensions = models.DateField(
        null=True,
        blank=True,
    )
    croris_title =  models.CharField(
        _("CroRIS title"),
        max_length=512,
        blank=True,
        null=True
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
        null=True,
        blank=True,
    )
    croris_id = models.PositiveBigIntegerField(
        _("CroRIS id")
    )
    croris_summary =  models.CharField(
        _("CroRIS summary"),
        max_length=512,
        blank=True,
        null=True
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
    croris_type = models.CharField(
        _("CroRIS tipProjekta"),
        max_length=128,
        blank=True,
        null=True
    )
    states = models.ForeignKey(State, on_delete=models.CASCADE)
    users = models.ManyToManyField(User, through='UserProject')


class Role(models.Model):
    name =  models.CharField(
        _("Role name"),
        max_length=24,
        blank=True,
        null=True
    )


class UserProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.OneToOneField(Role, on_delete=models.CASCADE)
    date_joined = models.DateField(
        null=True,
        blank=True,
    )
