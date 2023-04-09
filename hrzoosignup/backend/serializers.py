from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


def get_ssh_key_fingerprint(ssh_key):
    # How to get fingerprint from ssh key:
    # http://stackoverflow.com/a/6682934/175349
    # http://www.ietf.org/rfc/rfc4716.txt Section 4.
    import base64
    import hashlib

    key_body = base64.b64decode(ssh_key.strip().split()[1].encode('ascii'))
    fp_plain = hashlib.md5(key_body).hexdigest()  # noqa: S303
    return ':'.join(a + b for a, b in zip(fp_plain[::2], fp_plain[1::2]))


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'person_uniqueid',
            'person_institution',
            'person_affiliation',
            'person_organisation',
            'person_mail',
            'croris_first_name',
            'croris_last_name',
            'croris_mail',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'last_login',
            'username',
            'pk',
            'id')
        model = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'reason',
            'date_start',
            'date_end',
            'date_submitted',
            'date_approved',
            'approved_by',
            'denied_by',
            'science_field',
            'science_software',
            'science_extrasoftware',
            'science_extrasoftware_help',
            'resources_type',
            'is_active',
            'date_extensions',
            'croris_title',
            'croris_start',
            'croris_end',
            'croris_identifier',
            'croris_id',
            'croris_summary',
            'croris_collaborators',
            'croris_lead',
            'croris_finance',
            'croris_type',
            'states',
            'users'
        )
        model = models.Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
        )
        model = models.Project


class SshKeysSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'fingerprint',
            'public_key',
            'user'
        )
        model = models.SSHPublicKey
        read_only_fields=('fingerprint', )

    def validate_public_key(self, value):
        value = value.strip()
        if len(value.splitlines()) > 1:
            raise serializers.ValidationError(
                'Key is not valid: it should be single line.'
            )

        try:
            get_ssh_key_fingerprint(value)
        except (IndexError, TypeError):
            raise serializers.ValidationError(
                'Key is not valid: cannot generate fingerprint from it.'
            )
        return value

    def create(self, validated_data):
        complete = dict()
        complete['fingerprint'] = get_ssh_key_fingerprint(validated_data['public_key'])
        complete.update({key: value for key, value in validated_data.items()})
        return models.SSHPublicKey.objects.create(**complete)
