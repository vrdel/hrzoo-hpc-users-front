from django.db import models
from django.utils.translation import gettext_lazy as _

from backend.dbmodels.apikey import *
from backend.dbmodels.institution import *
from backend.dbmodels.invite import *
from backend.dbmodels.project import *
from backend.dbmodels.project_extend import *
from backend.dbmodels.resource_usage import *
from backend.dbmodels.sshkey import *
from backend.dbmodels.user import *
from backend.dbmodels.userproject import *


# TODO: remove
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
