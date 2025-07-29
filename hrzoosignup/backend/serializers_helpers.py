from backend import models
from django.contrib.auth import get_user_model
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


class GeneralSshKeysSerializer(serializers.ModelSerializer):
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

        if value in list(models.SSHPublicKey.objects. \
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
