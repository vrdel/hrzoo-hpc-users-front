from django.db import models
from rest_framework_api_key.models import AbstractAPIKey
from rest_framework_api_key.permissions import BaseHasAPIKey


class Organization4APIKey(models.Model):
    name = models.CharField(max_length=128)
    active = models.BooleanField(default=True)


class MyAPIKey(AbstractAPIKey):
    organization = models.ForeignKey(
        Organization4APIKey, on_delete=models.CASCADE, related_name="api_keys"
    )


class MyHasAPIKey(BaseHasAPIKey):
    model = MyAPIKey

    def has_organization_permission(self, request, organization_name):
        key = self.get_key(request)

        if not key:
            return False

        else:
            try:
                apikey = MyAPIKey.objects.get_from_key(key)

            except MyAPIKey.DoesNotExist:
                return False

            else:
                if (
                    not apikey.has_expired and
                    apikey.organization.name == organization_name
                ):
                    return True

                else:
                    return False


class HRZOOHasAPIKey(MyHasAPIKey):
    def has_permission(self, request, view):
        return self.has_organization_permission(
            request=request, organization_name="hrzoo"
        )


class MerlinHasAPIKey(MyHasAPIKey):
    def has_permission(self, request, view):
        return self.has_organization_permission(
            request=request, organization_name="merlin"
        )
