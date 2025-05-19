from django.db import models
from django.utils.translation import gettext_lazy as _


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
    parent = models.CharField(
        _("Long name of parent institution"),
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
        max_length=12,
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
