from django.core.cache import cache

from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model


class SAML2Backend(Saml2Backend):
    def _update_user(self, user, attributes, attribute_mapping, force_save=False):
        print('update-user-FOOOOOOOOOOOOOOBAR')

    def save_user(self, user, *args, **kwargs):
        print('save-user-FOOOOOOOOOOOOOOBAR')
