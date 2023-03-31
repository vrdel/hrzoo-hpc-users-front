from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('aaieduhr', 'institution', 'role', 'first_name', 'last_name',
                  'username', 'is_active', 'is_superuser', 'is_staff', 'email',
                  'date_joined', 'pk', 'id')
        model = get_user_model()
