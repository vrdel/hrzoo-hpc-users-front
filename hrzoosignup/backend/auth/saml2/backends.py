from django.core.cache import cache

from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model


class SAML2Backend(Saml2Backend):
    def _unpack(self, attr):
        if isinstance(attr, list):
            return attr[0]
        else:
            return attr

    def authenticate(self, request, session_info=None, attribute_mapping=None,
                     create_unknown_user=True):
        attributes = session_info['ava']

        username = self._unpack(attributes['hrEduPersonUniqueID'])
        first_name = self._unpack(attributes.get('givenName', ''))
        last_name = self._unpack(attributes.get('sn', ''))
        email = self._unpack(attributes.get('mail', ''))
        organization = self._unpack(attributes.get('o', ''))
        role = self._unpack(attributes.get('hrEduPersonPrimaryAffiliation', ''))

        userfound, created = None, None
        try:
            userfound = get_user_model().objects.get(username=username)
        except get_user_model().DoesNotExist:
            user, created = \
                get_user_model().objects.get_or_create(username=username,
                                                       first_name=first_name,
                                                       last_name=last_name,
                                                       email=email,
                                                       institution=organization,
                                                       aaieduhr=username,
                                                       role=role)

        if created:
            user.set_unusable_password()
            user.is_active = True
            user.is_staff = False

            user.save()

            return user

        elif userfound:
            userfound.email = email
            userfound.first_name = first_name
            userfound.last_name = last_name
            userfound.institution = organization
            userfound.aaieduhr = username
            userfound.role = role
            userfound.save()

            return userfound

        else:
            return None
