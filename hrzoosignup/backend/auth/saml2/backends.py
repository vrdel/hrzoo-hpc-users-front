from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model

from backend.models import CrorisInstitutions


class SAML2Backend(Saml2Backend):
    def authenticate(self, request, session_info=None, attribute_mapping=None,
                     create_unknown_user=True, assertion_info=None, **kwargs):
        idp_entityid = session_info["issuer"]

        if idp_entityid.startswith('https://edugainproxy.srce.hr/saml2/idp/'):
            attributes = session_info['ava']
            user_model = get_user_model()
            first_name = attributes.get('givenName', None)
            last_name = attributes.get('sn', None)
            if isinstance(first_name, list):
                first_name = first_name[0]
            if isinstance(last_name, list):
                last_name = last_name[0]
            try:
                user_found = user_model.objects.get(first_name=first_name, last_name=last_name)
                if self.user_can_authenticate(user_found):
                    return user_found
            except user_model.DoesNotExist:
                pass

        else:
            return super().authenticate(request, session_info, attribute_mapping, create_unknown_user, assertion_info, kwargs)

    def _update_user(self, user, attributes, attribute_mapping, force_save=False):
        try:
            if not user.person_institution_manual_set:
                hreduorgoib = attributes.get('hrEduOrgOIB', '')
                instit_croris = CrorisInstitutions.objects.get(oib=hreduorgoib[0])
                if user.person_institution != instit_croris.name_short:
                    user.person_institution = instit_croris.name_short
                    force_save = True

        except CrorisInstitutions.DoesNotExist:
            try:
                user_email = user.person_mail[0]
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

        return super()._update_user(user, attributes, attribute_mapping, force_save)

    def save_user(self, user, *args, **kwargs):
        if not user.status:
            user.status = False
        if not user.mailinglist_subscribe:
            user.mailinglist_subscribe = False
        return super().save_user(user, *args, **kwargs)
