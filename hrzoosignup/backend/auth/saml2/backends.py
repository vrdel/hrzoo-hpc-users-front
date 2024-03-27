from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model

from backend.models import CrorisInstitutions


class SAML2Backend(Saml2Backend):
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
