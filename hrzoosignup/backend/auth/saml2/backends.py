from django.core.cache import cache

from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model

# SAML2 hooks - left defaults, no overrides for now

class SAML2Backend(Saml2Backend):
    def _update_user(self, user, attributes, attribute_mapping, force_save=False):
        return super()._update_user(user, attributes, attribute_mapping, force_save)

    def save_user(self, user, *args, **kwargs):
        return super().save_user(user, *args, **kwargs)
