from backend import models
from rest_framework import serializers


def get_ssh_key_fingerprint(ssh_key):
    # How to get fingerprint from ssh key:
    # http://stackoverflow.com/a/6682934/175349
    # http://www.ietf.org/rfc/rfc4716.txt Section 4.
    import base64
    import hashlib

    key_body = base64.b64decode(ssh_key.strip().split()[1].encode('ascii'))
    fp_plain = hashlib.md5(key_body).hexdigest()  # noqa: S303
    return ':'.join(a + b for a, b in zip(fp_plain[::2], fp_plain[1::2]))


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.Role


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.State
