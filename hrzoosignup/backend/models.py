from django.db import models
from django.utils.translation import gettext_lazy as _

from backend.dbmodels.apikey import Organization4APIKey, MyAPIKey
from backend.dbmodels.institution import CrorisInstitutions
from backend.dbmodels.invite import CustomInvitation
from backend.dbmodels.project import ProjectCount, State, ProjectType, Project, StaffComment
from backend.dbmodels.project_extend import ProjectExtend
from backend.dbmodels.resource_usage import ResourceUsage
from backend.dbmodels.sshkey import SSHPublicKey, validate_ssh_public_key
from backend.dbmodels.user import User, Role
from backend.dbmodels.userproject import UserProject


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
