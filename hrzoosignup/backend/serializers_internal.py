import datetime

from rest_framework import serializers
from django.contrib.auth import get_user_model

from backend import models


class ScienceSoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('pk', 'name', 'created', 'added_by')
        model = models.ScienceSoftware


def get_ssh_key_fingerprint(ssh_key):
    # How to get fingerprint from ssh key:
    # http://stackoverflow.com/a/6682934/175349
    # http://www.ietf.org/rfc/rfc4716.txt Section 4.
    import base64
    import hashlib

    key_body = base64.b64decode(ssh_key.strip().split()[1].encode('ascii'))
    fp_plain = hashlib.md5(key_body).hexdigest()  # noqa: S303
    return ':'.join(a + b for a, b in zip(fp_plain[::2], fp_plain[1::2]))


class UsersSerializerFiltered(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'person_mail',
            'first_name',
            'last_name',
            'person_oib',
            'person_uniqueid',
            'person_institution',
            'person_organisation'
        )
        model = get_user_model()


class SshKeysSerializer(serializers.ModelSerializer):
    user = UsersSerializerFiltered(read_only=True)

    class Meta:
        fields = (
            'name',
            'fingerprint',
            'public_key',
            'date_created',
            'user'
        )
        model = models.SSHPublicKey
        read_only_fields = ('fingerprint', )

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

    def validate_name(self, value):
        value = value.strip()

        if value in list(models.SSHPublicKey.objects.\
                         filter(user=self.initial_data['user']).values_list('name', flat=True)):
            raise serializers.ValidationError(
                'Key of that name already exists'
            )
        return value

    def create(self, validated_data):
        complete = dict()
        complete['fingerprint'] = get_ssh_key_fingerprint(validated_data['public_key'])
        complete.update({key: value for key, value in validated_data.items()})
        complete['date_created'] = datetime.datetime.now()
        user = get_user_model().objects.get(id=self.initial_data['user'])
        complete['user'] = user
        return models.SSHPublicKey.objects.create(**complete)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.Role


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


class UsersSerializer(serializers.ModelSerializer):
    userproject_set = UserProjectSerializer(many=True, read_only=True)

    class Meta:
        fields = (
            'croris_first_name',
            'croris_last_name',
            'croris_mail',
            'date_joined',
            'first_name',
            'id',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
            'last_name',
            'person_affiliation',
            'person_institution',
            'person_mail',
            'person_oib',
            'person_organisation',
            'person_uniqueid',
            'pk',
            'username',
            'userproject_set'
        )
        model = get_user_model()


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.State


class StaffComment(serializers.ModelSerializer):
    class Meta:
        fields = (
            'comment',
            'date',
            'comment_by',
            'project_state'
        )
        model = models.StaffComment


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.ProjectType


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
            'croris_institute',
            'croris_lead',
            'croris_start',
            'croris_summary',
            'croris_title',
            'croris_type',
            'changed_by',
            'date_approved',
            'date_changed',
            'date_end',
            'date_start',
            'date_submitted',
            'denied_by',
            'id',
            'identifier',
            'institute',
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
            'staffcomment_set',
            'state',
            'userproject_set',
            'users',
        )
        model = models.Project
