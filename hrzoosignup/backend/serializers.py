from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


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


class SshKeysSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'fingerprint',
            'public_key',
            'user'
        )
        model = models.SSHPublicKey
