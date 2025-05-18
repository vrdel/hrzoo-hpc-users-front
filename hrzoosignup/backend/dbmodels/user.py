from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class Role(models.Model):
    name = models.CharField(
        _("Role name"),
        max_length=24,
        blank=True,
    )


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
