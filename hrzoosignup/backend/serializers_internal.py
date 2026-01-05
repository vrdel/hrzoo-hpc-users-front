from backend import models
from backend.utils.accounting import get_institute_long_name, short2long, \
    institutions_realms_dict, get_realm
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .serializers_helpers import RoleSerializer, GeneralSshKeysSerializer


class _StateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.State


class _ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
        )
        model = models.ProjectType


class _StaffComment(serializers.ModelSerializer):
    class Meta:
        fields = (
            'comment',
            'date',
            'comment_by',
            'project_state'
        )
        model = models.StaffComment


class UsersSerializerFiltered(serializers.ModelSerializer):
    sshkeys = serializers.SerializerMethodField()

    class Meta:
        fields = (
            'id',
            'first_name',
            'last_name',
            'person_institution',
            'person_mail',
            'person_oib',
            'person_organisation',
            'person_uniqueid',
            'status',
            'username',
            'sshkeys',
            'person_type'
        )
        model = get_user_model()

    def get_sshkeys(self, obj):
        return obj.sshpublickey_set.count() > 0


class SshKeysSerializer(GeneralSshKeysSerializer):
    pass


class UsersProjectSerializer(serializers.ModelSerializer):
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


class ProjectSerializerGet(serializers.ModelSerializer):
    users = UsersSerializerFiltered(many=True, read_only=True)
    state = _StateSerializer()
    project_type = _ProjectTypeSerializer()
    userproject_set = UsersProjectSerializer(many=True, read_only=True)
    staffcomment_set = _StaffComment(many=True, read_only=True)

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
            'science_field',
            'staff_resources_type',
            'staffcomment_set',
            'state',
            'userproject_set',
            'users',
        )
        model = models.Project


class ProjectExtendSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'project',
            'date',
            'date_end',
            'approved',
            'reason'
        )
        model = models.ProjectExtend


class ProjectSerializerFiltered(serializers.ModelSerializer):
    project_type = _ProjectTypeSerializer()
    state = _StateSerializer()

    class Meta:
        fields = (
            'croris_finance',
            'date_approved',
            'date_end',
            'date_start',
            'date_submitted',
            'id',
            'identifier',
            'institute',
            'is_active',
            'name',
            'project_type',
            'staff_resources_type',
            'state',
        )
        model = models.Project


class UserProjectSerializer(UsersProjectSerializer):
    project = ProjectSerializerFiltered()


class UserSerializerFiltered(serializers.ModelSerializer):
    userproject_set = UserProjectSerializer(many=True, read_only=True)

    class Meta:
        fields = (
            'id',
            'username',
            'person_mail',
            'first_name',
            'last_name',
            'person_oib',
            'person_uniqueid',
            'person_username',
            'person_affiliation',
            'person_mail',
            'croris_mbz',
            'person_institution',
            'person_organisation',
            'person_type',
            'status',
            'is_active',
            'is_staff',
            'is_superuser',
            'userproject_set',
        )
        model = get_user_model()


class ResourceUsageSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()
    institution = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    cpuh = serializers.SerializerMethodField()
    gpuh = serializers.SerializerMethodField()
    walltime = serializers.SerializerMethodField()
    wait_time = serializers.SerializerMethodField()
    realm = serializers.SerializerMethodField()
    tag = serializers.SerializerMethodField()
    vm = serializers.SerializerMethodField()

    def _get_institutions(self):
        return institutions_realms_dict()

    def _get_long_names(self):
        return get_institute_long_name()

    def get_project(self, obj):
        return obj.project.name

    def get_institution(self, obj):
        return short2long(self._get_long_names(), obj.project.institute)

    def get_type(self, obj):
        return obj.project.project_type.name

    @staticmethod
    def _get_field(obj, field):
        if obj.resource_name == "jupyter" and field in ["cpuh", "gpuh"]:
            field = f"jupyter_{field[0:3]}_h"

        try:
            return obj.accounting_record[field]

        except KeyError:
            return None

    def get_cpuh(self, obj):
        return self._get_field(obj, "cpuh")

    def get_gpuh(self, obj):
        return self._get_field(obj, "gpuh")

    def get_walltime(self, obj):
        return self._get_field(obj, "walltime")

    def get_wait_time(self, obj):
        try:
            return self._get_field(obj, "wait_time")

        except TypeError:
            return None

    def get_realm(self, obj):
        return get_realm(self._get_institutions(), obj.project.institute)

    def get_tag(self, obj):
        if obj.resource_name in ["supek", "padobran"]:
            if "gpu" in obj.accounting_record["queue"]:
                return "GPU"

            else:
                return "CPU"

        else:
            return None

    def get_vm(self, obj):
        try:
            return self._get_field(obj, "instance_id")

        except KeyError:
            return ""

    class Meta:
        fields = [
            "project", "institution", "type", "resource_name", "cpuh",
            "gpuh", "walltime", "wait_time", "realm", "tag", "vm"
        ]
        model = models.ResourceUsage


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
            'science_field',
            'staff_resources_type',
            'state',
            'users',
            'uses_ai_tech'
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
            'inviter',
            'invtype'
        )
        model = models.CustomInvitation
