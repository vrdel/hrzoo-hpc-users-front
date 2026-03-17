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
from backend.dbmodels.userproject_history import UserProjectHistory
