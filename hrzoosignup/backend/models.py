from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    aaieduhr = models.CharField(
        'hrEduPersonUniqueID',
        max_length=256,
        blank=True,
        null=True,
    )

    institution = models.CharField(
        'Institution',
        max_length=256,
        blank=True,
        null=True
    )

    role = models.CharField(
        'Role',
        max_length=64,
        blank=True,
        null=True
    )
