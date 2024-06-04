from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model
from django.conf import settings

from backend.models import CrorisInstitutions
from backend.utils.various import flatten
from unidecode import unidecode

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
            institute = attributes.get('o', '')
            affiliation = attributes.get('eduPersonAffiliation', '')
            if isinstance(first_name, list):
                first_name = first_name[0]
            if isinstance(last_name, list):
                last_name = last_name[0]
            if isinstance(username, list):
                username = username[0]
            if isinstance(affiliation, list):
                affiliation = affiliation[0]
            if isinstance(institute, list):
                institute = institute[0]
            if isinstance(email, list):
                person_email = email[0]

            if settings.DEBUG:
                logger.debug('SAML2Backend.authenticate()')
                logger.debug(session_info)

            all_names = user_model.objects.all().values_list('first_name', 'last_name')
            all_names = set([
                (unidecode(first_name.lower()), unidecode(last_name.lower()))
                for first_name, last_name in all_names
            ])
            if (unidecode(first_name.lower()), unidecode(last_name.lower())) in all_names:

                try:
                    user_found = user_model.objects.get(username=username)
                    if self.user_can_authenticate(user_found):
                        self._update_user(user_found, attributes, settings.EDUGAIN_SAML_ATTRIBUTE_MAPPING, force_save=True)
                        return user_found
                except user_model.DoesNotExist:
                    usermapped = set([username['from'] for username in settings.SAML_MAPEDUGAIN])
                    if username not in usermapped:
                        logger.error('SAML2Backend.authenticate() - Failed eduGAIN login - manual action needed: first_name and last_name already found but not with the same username')
                        logger.error(attributes)
                        request.saml2_backend_multiple = True
                        return None
                    else:
                        target_username = [mapuser for mapuser in settings.SAML_MAPEDUGAIN if mapuser['from'] == username][0]
                        user_found = user_model.objects.get(username=target_username['to'])
                        import ipdb; ipdb.set_trace()
                        if self.user_can_authenticate(user_found):
                            self._update_user(user_found, attributes, settings.EDUGAIN_SAML_ATTRIBUTE_MAPPING, force_save=True)
                            return user_found

            else:
                user_new = user_model.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    username=username,
                    person_uniqueid=username,
                    status=False,
                    mailinglist_subscribe=False,
                    person_mail=person_email,
                    person_institution=institute,
                    person_affiliation=affiliation
                )
                return user_new

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
