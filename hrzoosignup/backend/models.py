from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core import validators

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat import backends
from cryptography.exceptions import UnsupportedAlgorithm
from django.core.exceptions import ValidationError

from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string

from django.contrib.sites.shortcuts import get_current_site

try:
    from django.urls import reverse
except ImportError:
    from django.core.urlresolvers import reverse

from invitations.adapters import get_invitations_adapter
from invitations.app_settings import app_settings
from invitations.base_invitation import AbstractBaseInvitation
from invitations import signals

import datetime


def validate_ssh_public_key(ssh_key):
    if isinstance(ssh_key, str):
        ssh_key = ssh_key.encode('utf-8')

    try:
        serialization.load_ssh_public_key(ssh_key, backends.default_backend())
    except (ValueError, UnsupportedAlgorithm):
        raise ValidationError('Invalid SSH public key.')


class User(AbstractUser):
    status = models.BooleanField(
        blank=True,
        help_text='Custom is_active field that will designate whether user is assigned to active HRZOO project',
        verbose_name='custom_active'
    )
    mailinglist_subscribe = models.BooleanField(
        blank=True,
        help_text='Boolean field that indicates whether user is subscribed to mailinglist',
        verbose_name='mailinglist_subscribe'
    )
    person_uniqueid = models.CharField(
        _('hrEduPersonUniqueID - LDAP'),
        max_length=128,
        blank=True,
    )
    person_institution = models.CharField(
        _('Institution - LDAP'),
        max_length=128,
        blank=True,
    )
    person_institution_oib = models.CharField(
        _('Institution OIB number'),
        max_length=11,
        blank=True,
    )
    person_institution_manual_set = models.BooleanField(default=False)
    person_institution_realm = models.CharField(
        _('Institution realm - hrEduPersonHomeOrg'),
        max_length=64,
        blank=True,
    )
    person_organisation = models.CharField(
        _('Organisation unit - LDAP'),
        max_length=128,
        blank=True,
    )
    person_oib = models.CharField(
        _('OIB number - LDAP'),
        max_length=11,
        blank=True,
    )
    person_affiliation = models.CharField(
        _('Affiliation - LDAP'),
        max_length=64,
        blank=True,
    )
    person_type = models.CharField(
        _('Local, Foreigner'),
        max_length=32,
        blank=True,
    )
    person_type_manual_set = models.BooleanField(default=False)
    person_mail = models.EmailField(
        _('Email - LDAP'),
        max_length=64,
        blank=True,
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
    croris_mbz = models.CharField(
        _('CroRIS MBZ number'),
        max_length=10,
        blank=True,
        null=True,
    )
    person_username = models.CharField(
        _("Username - LDAP"),
        max_length=10,
        blank=True
    )


class SSHPublicKey(models.Model):
    name = models.CharField(
        max_length=128,
        blank=True
    )
    fingerprint = models.CharField(max_length=47)
    public_key = models.TextField(
        validators=[validators.MaxLengthValidator(2000), validate_ssh_public_key]
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_created = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = ('user', 'fingerprint')


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


class Role(models.Model):
    name = models.CharField(
        _("Role name"),
        max_length=24,
        blank=True,
    )


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


class ProjectCount(models.Model):
    counter = models.IntegerField(null=True)


class ScienceSoftware(models.Model):
    name = models.CharField(
        _("modulefile or concrete software name"),
        max_length=24,
        blank=True,
    )
    created = models.DateTimeField(
        _("Datetime when application is added"),
        null=True,
        blank=True
    )
    added_by = models.JSONField(
        _("JSONField with few details of staff that added application"),
        blank=True,
        null=True
    )


def is_foreign_invite(target_email, request):
    frg_collabs = request.data.get('foreignCollaboratorEmails')

    if frg_collabs:
        emails = set([collab['value'] for collab in frg_collabs])
        if target_email in emails:
            return True

    return False


# picked from invitations.model and overriden it as I didn't like
# uniqueness on email as we'll need to send multiple project invitations
# on the same email. also added relation to project.
# -vrdel
class CustomInvitation(AbstractBaseInvitation):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    email = models.EmailField(
        verbose_name=_("e-mail address"),
        max_length=254,
    )
    created = models.DateTimeField(verbose_name=_("created"), default=timezone.now)
    person_oib = models.CharField(_('OIB number'), max_length=11, blank=True,)
    invtype = models.CharField(_('Invitation type'), max_length=16, blank=True)

    class Meta:
        unique_together = ['project', 'email']

    @classmethod
    def create(cls, email, inviter=None, **kwargs):
        key = get_random_string(64).lower()
        instance = cls._default_manager.create(
            email=email, key=key, inviter=inviter, **kwargs
        )
        return instance

    def key_expired(self):
        expiration_date = self.sent + datetime.timedelta(
            days=app_settings.INVITATION_EXPIRY,
        )
        return expiration_date <= timezone.now()

    def send_invitation(self, request, **kwargs):
        current_site = get_current_site(request)
        invite_url = reverse(app_settings.CONFIRMATION_URL_NAME, args=[self.key])
        invite_url = request.build_absolute_uri(invite_url)

        invite_foreigner = is_foreign_invite(self.email, request)
        if invite_foreigner:
            self.invtype = 'foreign'
        else:
            self.invtype = 'local'

        ctx = kwargs
        ctx.update(
            {
                "invite_url": '{}://{}/ui/login-email/{}'.format(
                    request.scheme,
                    request.get_host(),
                    self.key
                ),
                "site_name": current_site.name,
                "project_name": self.project.name,
                "email": self.email,
                "key": self.key,
                "inviter": self.inviter,
                "first_name": self.inviter.first_name,
                "last_name": self.inviter.last_name,
            },
        )

        if invite_foreigner:
            email_template = "invitations/email/email_invite_en"
            settings.DEFAULT_FROM_EMAIL = 'Advanced Computing <computing@srce.hr>'
        else:
            email_template = "invitations/email/email_invite"
            settings.DEFAULT_FROM_EMAIL = 'Napredno računanje <computing@srce.hr>'

        get_invitations_adapter().send_mail(email_template, self.email, ctx)
        self.sent = timezone.now()
        self.save()

        signals.invite_url_sent.send(
            sender=self.__class__,
            instance=self,
            invite_url_sent=invite_url,
            inviter=self.inviter,
        )

    def __str__(self):
        return f"Invite: {self.email}"


class CrorisInstitutions(models.Model):
    active = models.BooleanField(
        _('Institution exist in the register'),
        blank=True,
    )
    name_long = models.CharField(
        _("Long name of institution"),
        max_length=512,
        blank=True,
    )
    name_short = models.CharField(
        _("Short name of institution"),
        max_length=256,
        blank=True,
    )
    name_acronym = models.CharField(
        _("Acronym of institution"),
        max_length=256,
        blank=True,
    )
    oib = models.CharField(
        _('OIB number'),
        max_length=11,
        blank=True,
    )
    mbs = models.CharField(
        _('MBS number'),
        max_length=9,
        blank=True,
    )
    mbu = models.CharField(
        _('MBU number'),
        max_length=3,
        blank=True,
    )
    contact_web = models.CharField(
        _("Web URL of institution"),
        max_length=256,
        blank=True,
    )
    contact_email = models.CharField(
        _("Main email contact of institution"),
        max_length=128,
        blank=True,
    )
    realm = models.CharField(
        _('AAI@EduHR realm'),
        max_length=16,
        blank=True,
    )

    def __str__(self):
        return self.name_short


class ResourceUsage(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    resource_name = models.CharField(max_length=128, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    accounting_record = models.JSONField(blank=True, null=True)
