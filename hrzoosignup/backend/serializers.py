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


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.Role


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'approved_by',
            'croris_collaborators',
            'croris_end',
            'croris_finance',
            'croris_id',
            'croris_identifier',
            'croris_lead',
            'croris_start',
            'croris_summary',
            'croris_title',
            'croris_type',
            'date_approved',
            'date_end',
            'date_extensions',
            'date_start',
            'date_submitted',
            'denied_by',
            'identifier',
            'is_active',
            'name',
            'project_type',
            'reason',
            'resources_numbers',
            'resources_type',
            'science_extrasoftware',
            'science_extrasoftware_help',
            'science_field',
            'science_software',
            'state',
            'users',
        )
        model = models.Project


class UsersSerializerFiltered(serializers.ModelSerializer):
    class Meta:
        fields = (
            'person_mail',
            'first_name',
            'last_name',
        )
        model = get_user_model()


class UserProjectSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    user = UsersSerializerFiltered()
    class Meta:
        fields = (
            'user',
            'project',
            'role',
            'date_joined'
        )
        model = models.UserProject


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.State


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.ProjectType


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


class StaffComment(serializers.ModelSerializer):
    class Meta:
        fields = (
            'comment',
            'date',
            'comment_by',
            'project_state'
        )
        model = models.StaffComment


class ProjectSerializerGet(serializers.ModelSerializer):
    users = UsersSerializerFiltered(many=True, read_only=True)
    state = StateSerializer()
    project_type = ProjectTypeSerializer()
    userproject_set = UserProjectSerializer(many=True, read_only=True)
    staffcomment_set = StaffComment(many=True, read_only=True)

    class Meta:
        fields = (
            'approved_by',
            'croris_collaborators',
            'croris_end',
            'croris_finance',
            'croris_id',
            'croris_identifier',
            'croris_lead',
            'croris_start',
            'croris_summary',
            'croris_title',
            'croris_type',
            'date_approved',
            'date_end',
            'date_extensions',
            'date_start',
            'date_submitted',
            'denied_by',
            'identifier',
            'is_active',
            'name',
            'project_type',
            'reason',
            'resources_numbers',
            'resources_type',
            'science_extrasoftware',
            'science_extrasoftware_help',
            'science_field',
            'science_software',
            'staff_resources_type',
            'state',
            'users',
            'userproject_set',
            'staffcomment_set'
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
