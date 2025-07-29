import copy
import datetime

from backend import models
from backend.utils.gen_username import gen_username
from backend.utils.usage_data_preparation import Usage
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .serializers_helpers import (
    RoleSerializer, get_ssh_key_fingerprint, StateSerializer,
    ProjectTypeSerializer
)


def _get_project_identifier(project_type):
    cobj = models.ProjectCount.objects.get()
    if project_type == "research-institutional":
        identifier = "NRI-{}-{:03}".format(
            timezone.now().strftime('%Y-%m'), cobj.counter
        )
    elif project_type == "internal":
        identifier = "NRM-{}-{:03}".format(
            timezone.now().strftime('%Y-%m'), cobj.counter
        )
    elif project_type == "srce-workshop":
        identifier = 'NRR-{}-{:03}'.format(
            timezone.now().strftime('%Y-%m'), cobj.counter
        )
    else:
        identifier = 'NR-{}-{:03}'.format(
            timezone.now().strftime('%Y-%m'), cobj.counter
        )

    return identifier, cobj


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


class UsersSerializer4SSHKeys(serializers.ModelSerializer):
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
            'pk',
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
            'inviter',
            'invtype'
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
    user = UsersSerializer4SSHKeys(read_only=True)


class ScienceSoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('pk', 'name', 'created', 'added_by')
        model = models.ScienceSoftware


class ResourceUsageListSerializer(serializers.Serializer):
    jobid = serializers.CharField()

    @staticmethod
    def list_jobids(resource):
        data = models.ResourceUsage.objects.filter(resource_name=resource)
        jobids = sorted(
            list(set(data.values_list("accounting_record__jobid", flat=True)))
        )
        return jobids


class UsageSerializer(serializers.Serializer):
    user = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    jobid = serializers.CharField(required=False, allow_blank=True)
    walltime = serializers.CharField(required=False, allow_blank=True)
    project = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    start_time = serializers.CharField(required=False, allow_blank=True)
    end_time = serializers.CharField(required=True)
    queue = serializers.CharField(required=False, allow_blank=True)
    wait_time = serializers.CharField(required=False, allow_blank=True)
    qtime = serializers.CharField(required=False, allow_blank=True)
    ncpus = serializers.CharField(required=False, allow_blank=True)
    ngpus = serializers.CharField(required=False, allow_blank=True)
    jupyter_cpu_h = serializers.FloatField(required=False)
    jupyter_gpu_h = serializers.FloatField(required=False)
    instance_id = serializers.CharField(required=False, allow_blank=True)
    flavor = serializers.CharField(required=False, allow_blank=True)
    vcpus = serializers.CharField(required=False, allow_blank=True)
    started_at = serializers.CharField(required=False, allow_blank=True)
    ended_at = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class ResourceUsageSerializer(serializers.Serializer):
    usage = UsageSerializer(many=True)

    def save(self, **kwargs):
        if len(self.validated_data["usage"]) > 0:
            usage = Usage(
                data=self.validated_data["usage"],
                resource=kwargs["resource"],
                chunk_size=settings.CHUNK_SIZE
            )

            try:
                usage.save()

            except KeyError as e:
                raise serializers.ValidationError(f"Missing {str(e)} field")

            else:
                return usage

        else:
            return None


class AccountingUsersSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source="person_uniqueid")
    ime = serializers.CharField(source="first_name")
    prezime = serializers.CharField(source="last_name")
    mail = serializers.EmailField(source="person_mail")
    ustanova = serializers.SerializerMethodField()

    def get_ustanova(self, obj):
        try:
            person_institution = models.CrorisInstitutions.objects.get(
                name_short=obj.person_institution
            )

            if person_institution.name_long:
                person_institution = person_institution.name_long

            else:
                person_institution = obj.person_institution

        except models.CrorisInstitutions.DoesNotExist:
            person_institution = obj.person_institution

        return person_institution

    class Meta:
        fields = ["id", "uid", "ime", "prezime", "mail", "ustanova"]
        model = models.User


def _flatten_scientific_field(field):
    reformat_sfs = list()

    for sf in field:
        rsf = dict()
        rsf['name'] = sf['name']['value']
        rsf['percent'] = sf['percent']
        rsf['scientificfields'] = list()
        for fl in sf['scientificfields']:
            rsf_s = dict()
            rsf_s['name'] = fl['name']['value']
            rsf_s['percent'] = fl['percent']
            rsf['scientificfields'].append(rsf_s)

        reformat_sfs.append(rsf)

    return reformat_sfs


def _flatten_resources_type(res_types):
    if res_types:
        return [t['value'] for t in res_types]
    else:
        return []


class AccountingUserProjectSerializer(serializers.ModelSerializer):
    sifra = serializers.SerializerMethodField()
    date_from = serializers.DateField(source="date_start")
    ustanova = serializers.SerializerMethodField()
    croris_url = serializers.SerializerMethodField()
    realm = serializers.SerializerMethodField()
    finance = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    approved_resources = serializers.SerializerMethodField()
    users = AccountingUsersSerializer(many=True)

    @staticmethod
    def get_sifra(obj):
        sifra = obj.identifier
        for field in settings.PROJECT_IDENTIFIER_MAP:
            if field['from'] in sifra:
                return sifra.replace(field['from'], field['to'])

        return sifra

    @staticmethod
    def get_type(obj):
        return obj.project_type.name

    @staticmethod
    def get_finance(obj):
        if obj.croris_finance:
            return obj.croris_finance
        else:
            try:
                return [
                    models.CrorisInstitutions.objects.get(
                        name_short=obj.institute
                    ).name_long
                ]

            except models.CrorisInstitutions.DoesNotExist:
                return [obj.institute]

    @staticmethod
    def get_ustanova(obj):
        try:
            ustanova = models.CrorisInstitutions.objects.get(
                name_short=obj.institute
            )

            if not ustanova.name_long:
                name_long = obj.institute

            else:
                name_long = ustanova.name_long

            return {
                "naziv": name_long,
                "oib": ustanova.oib,
                "mbu": ustanova.mbu
            }

        except models.CrorisInstitutions.DoesNotExist:
            return {
                "naziv": obj.institute,
                "oib": "",
                "mbu": ""
            }

    @staticmethod
    def get_croris_url(obj):
        if obj.croris_id:
            return f'https://www.croris.hr/projekti/projekt/{obj.croris_id}'
        else:
            return ''

    @staticmethod
    def _set_realm_from_map(inst_name):
        for field in settings.MAP_REALMS:
            if field['from'] in inst_name:
                return inst_name.replace(field['from'], field['to'])
        return ''

    def get_realm(self, obj):
        try:
            realm_inst = models.CrorisInstitutions.objects.get(
                name_short=obj.institute
            ).realm

        except models.CrorisInstitutions.DoesNotExist:
            realm_inst = ''

        if not realm_inst:
            realm_inst = self._set_realm_from_map(obj.institute)

        return realm_inst

    @staticmethod
    def get_approved_resources(obj):
        res_types = obj.staff_resources_type
        return _flatten_resources_type(res_types)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["date_approved"] = ret["date_approved"][0:10]
        ret["science_field"] = _flatten_scientific_field(ret["science_field"])

        return ret

    class Meta:
        fields = [
            "id", "sifra", "date_from", "date_end", "date_approved", "type",
            "name", "ustanova", "croris_url", "science_field", "realm",
            "finance", "approved_resources", "users"
        ]
        model = models.Project


class NewProjectLeadUserSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    person_oib = serializers.CharField(max_length=11, allow_blank=True)
    person_mail = serializers.EmailField(max_length=64)
    username = serializers.CharField(max_length=128)


class ScientificFieldSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    percent = serializers.IntegerField()


class ResourcesTypeSerializer(serializers.ListSerializer):
    child = serializers.CharField(max_length=128)


class NewProjectScienceFieldSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    percent = serializers.IntegerField()
    scientificfields = ScientificFieldSerializer(many=True)


class NewProjectsSerializer(serializers.Serializer):
    user = NewProjectLeadUserSerializer()
    project_type = serializers.CharField()
    date_end = serializers.DateField(format="%Y-%m-%d")
    date_start = serializers.DateField(format="%Y-%m-%d")
    name = serializers.CharField(max_length=256)
    reason = serializers.CharField(max_length=4096)
    institute = serializers.IntegerField()
    science_field = NewProjectScienceFieldSerializer(many=True)
    resources_type = ResourcesTypeSerializer()

    @staticmethod
    def validate_project_type(value):
        try:
            models.ProjectType.objects.get(name=value)

            return value

        except models.ProjectType.DoesNotExist:
            raise serializers.ValidationError(
                f"{value} nije dozvoljeni tip projekta"
            )


    @staticmethod
    def validate_science_field(field_value):
        for item in field_value:
            for key, value in item.items():
                if key == "name":
                    item["name"] = {
                        "label": value,
                        "value": value
                    }

                elif key == "scientificfields":
                    for item2 in item[key]:
                        item2["name"] = {
                            "label": item2["name"],
                            "value": item2["name"]
                        }

        return field_value

    @staticmethod
    def validate_resources_type(value):
        new_value = []
        for val in value:
            if val.lower() not in settings.ALLOWED_RESOURCES:
                raise serializers.ValidationError(
                    f"{val} nije dozvoljeni tip resursa"
                )

            else:
                for item in value:
                    new_value.append({"label": item, "value": item})

        return new_value

    @staticmethod
    def validate_user(value):
        try:
            models.User.objects.get(person_oib=value["person_oib"])

        except models.User.DoesNotExist:
            value["person_username"] = gen_username(
                value["first_name"], value["last_name"]
            )
            value["person_uniqueid"] = value["username"]
            value["status"] = True
            value["mailinglist_subscribe"] = True
            models.User.objects.create_user(**value)

        return value

    @staticmethod
    def _get_institution_name(dashboard_institutions, inst_id):
        ustanova = [
            ustanova for ustanova in dashboard_institutions if
            ustanova["ustanovaId"] == inst_id
        ][0]
        institution = ustanova["naziv"]

        if ustanova["oib"]:
            try:
                institution = models.CrorisInstitutions.objects.get(
                    oib=ustanova["oib"]
                ).name_short

            except models.CrorisInstitutions.DoesNotExist:
                pass

        elif ustanova["mbu"]:
            try:
                institution = models.CrorisInstitutions.objects.get(
                    mbu=ustanova["mbu"]
                ).name_short

            except models.CrorisInstitutions.DoesNotExist:
                pass

        return institution

    def save(self, **kwargs):
        merlin_user = models.User.objects.get(username="merlin@srce.hr")
        data = copy.deepcopy(self.validated_data)
        user = copy.deepcopy(self.validated_data["user"])
        del data["user"]

        data["date_submitted"] = timezone.now()
        identifier, cobj = _get_project_identifier(data["project_type"])
        data["identifier"] = identifier
        data["project_type"] = models.ProjectType.objects.get(
            name=data["project_type"]
        )
        data["science_software"] = []
        data["science_extrasoftware_help"] = False
        data["resources_numbers"] = {}
        data["is_active"] = True
        data["approved_by"] = {
            "first_name": merlin_user.first_name,
            "last_name": merlin_user.last_name,
            "person_uniqueid": merlin_user.person_uniqueid,
            "username": merlin_user.username
        }
        date_approved = timezone.now()
        data["date_approved"] = date_approved
        data["date_changed"] = date_approved
        data["staff_resources_type"] = data["resources_type"]
        data["state"] = models.State.objects.get(name="approve")
        data["institute"] = self._get_institution_name(
            kwargs["dashboard_institutions"], data["institute"]
        )
        project = models.Project(**data)
        project.save()

        cobj.counter += 1
        cobj.save()

        userproject_obj = models.UserProject(
            user=models.User.objects.get(person_oib=user["person_oib"]),
            project=project,
            role=models.Role.objects.get(name="lead"),
            date_joined=timezone.now()
        )
        userproject_obj.save()

        return project


class MerlinProjectUsersSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source="user.person_mail")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    role = serializers.SerializerMethodField()
    accepted = serializers.SerializerMethodField()

    @staticmethod
    def get_role(obj):
        return obj.role.name

    def get_accepted(self, obj):
        return True

    class Meta:
        fields = ["email", "first_name", "last_name", "role", "accepted"]
        model = models.UserProject


class MerlinSentInvitationsSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_first_name(self, obj):
        return ""

    def get_last_name(self, obj):
        return ""

    def get_role(self, obj):
        return "collaborator"

    class Meta:
        fields = ["email", "first_name", "last_name", "role", "accepted"]
        model = models.CustomInvitation


class MerlinProjectsSerializer(serializers.ModelSerializer):
    date_approved = serializers.DateTimeField(format="%Y-%m-%d")
    date_submitted = serializers.DateTimeField(format="%Y-%m-%d")
    project_type = serializers.SerializerMethodField()
    resources_type = ResourcesTypeSerializer()
    state = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()

    def get_users(self, obj):
        user_projects = models.UserProject.objects.filter(project=obj)
        invited_users = models.CustomInvitation.objects.filter(project=obj)
        data = MerlinProjectUsersSerializer(
            user_projects, many=True
        ).data
        invited_users_data = MerlinSentInvitationsSerializer(
            invited_users, many=True
        ).data
        data.extend(
            [user for user in invited_users_data if not user["accepted"]]
        )
        return data

    @staticmethod
    def get_project_type(obj):
        return obj.project_type.name

    @staticmethod
    def get_state(obj):
        return obj.state.name

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["resources_type"] = _flatten_resources_type(
            instance.staff_resources_type
        )
        ret["science_field"] = _flatten_scientific_field(ret["science_field"])

        return ret

    class Meta:
        fields = [
            "id", "date_approved", "date_start", "date_end", "date_submitted",
            "identifier", "institute", "is_active", "name", "project_type",
            "reason", "resources_type", "state", "users", "science_field"
        ]
        model = models.Project


class StudentsListSerializer(serializers.ListSerializer):
    child = serializers.EmailField(max_length=128)


class ProjectsUsersSerializer(serializers.Serializer):
    requester = NewProjectLeadUserSerializer()
    project = serializers.IntegerField()
    students = StudentsListSerializer()

    @staticmethod
    def validate_requester(value):
        if value["person_oib"]:
            try:
                return models.User.objects.get(person_oib=value["person_oib"])

            except models.User.DoesNotExist:
                raise serializers.ValidationError(
                    f"Korisnik s OIB-om {value['person_oib']} nije pronađen"
                )

        else:
            try:
                return models.User.objects.get(username=value["username"])

            except models.User.DoesNotExist:
                raise serializers.ValidationError(
                    f"Korisnik s korisničkim imenom {value['username']} nije "
                    f"pronađen"
                )

    @staticmethod
    def validate_project(value):
        try:
            return models.Project.objects.get(id=value)

        except models.Project.DoesNotExist:
            raise serializers.ValidationError(
                f"Projekt id={value} nije pronađen"
            )

    def validate_students(self, value):
        if len(value) == 0:
            raise serializers.ValidationError("Nije zadana niti jedna adresa")

        else:
            return value

    def invite(self, request):
        self.is_valid(raise_exception=True)
        project = self.validated_data["project"]
        project.date_changed = timezone.now()
        user = get_user_model().objects.get(
            username="merlin@srce.hr"
        )
        project.changed_by = {
            "username": user.username,
            "last_name": user.last_name,
            "first_name": user.first_name,
            "person_uniqueid": user.person_uniqueid
        }
        project.save()

        sent_invites = list()
        errors = dict()
        for email in self.validated_data["students"]:
            try:
                invite = models.CustomInvitation.create(
                    email,
                    inviter=self.validated_data["requester"],
                    project=project,
                    person_oib=""
                )
                invite.send_invitation(request)
                sent_invites.append(email)

            except Exception as e:
                errors.update({email: str(e)})
                continue

        return sent_invites, errors
