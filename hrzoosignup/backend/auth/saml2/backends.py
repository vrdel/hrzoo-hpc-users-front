from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model
from django.conf import settings

from backend.models import CrorisInstitutions
from backend.utils.various import flatten

import logging

logger = logging.getLogger('hrzoosignup.views')


def is_authn_via_aaieduhr(session_info):
    authn_info = session_info.get('authn_info', None)
    flat_auth_info = list(flatten(authn_info))
    found = list(filter(lambda el: settings.SAML_AAIEDUHRIDPMATCH in el, flat_auth_info))
    if len(found) > 0:
        return True
    return False


class SAML2Backend(Saml2Backend):
    def authenticate(self, request, session_info=None, attribute_mapping=None,
                     create_unknown_user=True, assertion_info=None, **kwargs):
        self.idp_entityid = session_info["issuer"]

        if self.idp_entityid.startswith(settings.SAML_EDUGAINIDPMATCH):
            if not settings.SAML_EDUGAINALLOWAAIEDUHR and is_authn_via_aaieduhr(session_info):
                return None

            attributes = session_info['ava']
            user_model = get_user_model()
            first_name = attributes.get('givenName', '')
            last_name = attributes.get('sn', '')
            username = attributes.get('eduPersonPrincipalName', '')
            email = attributes.get('mail', '')
            affiliation = attributes.get('eduPersonAffiliation', '')
            if isinstance(first_name, list):
                first_name = first_name[0]
            if isinstance(last_name, list):
                last_name = last_name[0]
            if isinstance(username, list):
                username = username[0]
            if isinstance(affiliation, list):
                affiliation = affiliation[0]

            try:
                if isinstance(email, list):
                    nm = len(email)
                    i = 1
                    for mail in email:
                        try:
                            user_found = user_model.objects.get(person_mail=mail)
                            if user_found:
                                break
                        except user_model.DoesNotExist as exc:
                            if i == nm:
                                raise exc
                            else:
                                i += 1
                                pass

                else:
                    user_found = user_model.objects.get(person_mail=email)

                if user_found:
                    self._update_user(user_found, attributes, settings.EDUGAIN_SAML_ATTRIBUTE_MAPPING, force_save=True)
                if self.user_can_authenticate(user_found):
                    return user_found

            except user_model.DoesNotExist:
                try:
                    user_found = user_model.objects.get(first_name=first_name, last_name=last_name)
                    if user_found:
                        self._update_user(user_found, attributes, settings.EDUGAIN_SAML_ATTRIBUTE_MAPPING, force_save=True)
                    if self.user_can_authenticate(user_found):
                        return user_found

                except user_model.DoesNotExist:
                    user_new = user_model.objects.create(
                        first_name=first_name,
                        last_name=last_name,
                        username=username,
                        person_uniqueid=username,
                        status=False,
                        mailinglist_subscribe=False,
                        person_mail=email,
                        person_affiliation=affiliation
                    )
                    return user_new

            except user_model.MultipleObjectsReturned as exc:
                logger.error(f'Failed eduGAIN login: {attributes} - {repr(exc)}')
                request.saml2_backend_multiple = True
                return None

        else:
            return super().authenticate(request, session_info, attribute_mapping, create_unknown_user, assertion_info, **kwargs)

    def _update_user(self, user, attributes, attribute_mapping, force_save=False):
        try:
            if not user.person_institution_manual_set:
                hreduorgoib = attributes.get('hrEduOrgOIB', '')
                if hreduorgoib:
                    instit_croris = CrorisInstitutions.objects.get(oib=hreduorgoib[0])
                    if user.person_institution != instit_croris.name_short:
                        user.person_institution = instit_croris.name_short
                        force_save = True

        except CrorisInstitutions.DoesNotExist:
            try:
                if isinstance(user.person_mail, list):
                    user_email = user.person_mail[0]
                else:
                    user_email = user.person_mail
                user_email_domain = user_email.split('@')[1]
                found = CrorisInstitutions.objects.get(contact_web__contains=user_email_domain)
                user.person_institution = found.name_short
                force_save = True

            except (CrorisInstitutions.DoesNotExist, CrorisInstitutions.MultipleObjectsReturned):
                if user.person_institution != attributes['o'][0]:
                    user.person_institution = attributes['o'][0]
                    force_save = True

            except IndexError:
                pass

        if self.idp_entityid.startswith(settings.SAML_EDUGAINIDPMATCH):
            user.person_type = 'foreign'
            force_save = True
        else:
            user.person_type = 'local'
            force_save = True

        return super()._update_user(user, attributes, attribute_mapping, force_save)

    def save_user(self, user, *args, **kwargs):
        if not user.status:
            user.status = False
        if not user.mailinglist_subscribe:
            user.mailinglist_subscribe = False
        return super().save_user(user, *args, **kwargs)
