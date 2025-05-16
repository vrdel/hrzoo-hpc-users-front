from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core import validators

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat import backends
from cryptography.exceptions import UnsupportedAlgorithm

from django.core.exceptions import ValidationError

from .user import User


def validate_ssh_public_key(ssh_key):
    if isinstance(ssh_key, str):
        ssh_key = ssh_key.encode('utf-8')

    try:
        serialization.load_ssh_public_key(ssh_key, backends.default_backend())
    except (ValueError, UnsupportedAlgorithm):
        raise ValidationError('Invalid SSH public key.')


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
