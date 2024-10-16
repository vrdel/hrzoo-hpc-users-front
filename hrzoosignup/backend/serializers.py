from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

import datetime

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
            'change_history',
            'changed_by',
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
            'state',
            'users',
        )
        model = models.Project


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


class ProjectSerializerFiltered(serializers.ModelSerializer):
    project_type = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    staff_resources_type = serializers.SerializerMethodField()

    class Meta:
        fields = (
            'id',
            'identifier',
            'is_active',
            'name',
            'institute',
            'project_type',
            'resources_numbers',
            'staff_resources_type',
            'state'
        )
        model = models.Project

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)

    def get_staff_resources_type(self, obj):
        res_types = obj.staff_resources_type
        if res_types:
            return [t['value'] for t in res_types]
        else:
            return []

    def get_project_type(self, obj):
        return obj.project_type.name

    def get_state(self, obj):
        return obj.state.name


class UsersSerializerFiltered(serializers.ModelSerializer):
    sshkeys = serializers.SerializerMethodField()

    class Meta:
        fields = (
            'id',
            'username',
            'person_mail',
            'first_name',
            'last_name',
            'person_oib',
            'person_uniqueid',
            'person_institution',
            'person_organisation',
            'person_affiliation',
            'person_type',
            'sshkeys',
            'status'
        )
        model = get_user_model()

    def get_sshkeys(self, obj):
        return obj.sshpublickey_set.count() > 0


class UsersSerializerFiltered2(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'person_username',
        )
        model = get_user_model()


class UsersSerializerFiltered3(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'person_oib',
            'first_name',
            'last_name',
            'person_mail',
            'person_username',
            'person_type',
            'username',
            'status',
            'is_active',
            'is_staff',
            'is_superuser'
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


class UserProjectSerializer2(serializers.ModelSerializer):
    user = UsersSerializerFiltered3()
    project = ProjectSerializerFiltered()

    class Meta:
        fields = (
            'user',
            'project',
            'date_joined',
        )
        model = models.UserProject


class UsersSerializer(serializers.ModelSerializer):
    userproject_set = UserProjectSerializer(many=True, read_only=True)

    class Meta:
        fields = (
            'croris_first_name',
            'croris_last_name',
            'croris_mail',
            'croris_mbz',
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
            'person_username',
            'person_type',
            'pk',
            'status',
            'username',
            'userproject_set'
        )
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
            'id',
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


class AccountingProjectUsersSerializerGet(serializers.ModelSerializer):
    users = UsersSerializerFiltered(many=True, read_only=True)
    state = StateSerializer()
    project_type = ProjectTypeSerializer()
    userproject_set = UserProjectSerializer(many=True, read_only=True)
    staffcomment_set = StaffComment(many=True, read_only=True)

    class Meta:
        fields = (
            'id',
            'identifier',
            'institute',
            'name',
            'project_type',
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


class InvitesSerializer(serializers.ModelSerializer):
    inviter = UsersSerializerFiltered(read_only=True)
    project = ProjectSerializer(read_only=True)

    class Meta:
        fields = (
            'project',
            'email',
            'created',
            'accepted',
            'inviter'
        )
        model = models.CustomInvitation


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
        complete['date_created'] = timezone.make_aware(datetime.datetime.now())
        user = get_user_model().objects.get(id=self.initial_data['user'])
        complete['user'] = user
        return models.SSHPublicKey.objects.create(**complete)


class SshKeysSerializer2(SshKeysSerializer):
    user = UsersSerializerFiltered2(read_only=True)


class ScienceSoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('pk', 'name', 'created', 'added_by')
        model = models.ScienceSoftware
