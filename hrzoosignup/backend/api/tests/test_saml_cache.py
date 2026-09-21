from django.contrib.auth.models import update_last_login
from django.core.cache import cache
from django.test import TransactionTestCase, override_settings
from unittest.mock import patch

from backend import models
from backend.auth.saml2.backends import SAML2Backend
from backend.caching import entries, invalidation


@override_settings(
    SAML_DEBUG=False,
    SAML_EDUGAINIDPMATCH='https://edugain.example/',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                        'LOCATION': 'saml-cache-tests'}},
)
class SamlCacheTests(TransactionTestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.user = models.User.objects.create(
            username='member', first_name='Member', status=True,
            mailinglist_subscribe=False, person_type='local',
            person_institution='Canonical institution', person_mail='member@example.org')
        self.institution = models.CrorisInstitutions.objects.create(
            oib='123', name_short='Canonical institution', active=True)
        self.backend = SAML2Backend()
        self.backend.idp_entityid = 'https://aai.example/'
        self.attributes = {'hrEduOrgOIB': ['123'], 'o': ['Different SAML name'],
                           'givenName': ['Member'], 'mail': ['member@example.org']}
        self.mapping = {'givenName': ('first_name',), 'mail': ('person_mail',)}

    def warm(self):
        keys = list(invalidation.USER_ENTRIES) + [entry.key(account=self.user.username)
                for entry in (entries.USER_USAGE, entries.PROJECT_USER_USAGE, entries.PROJECT_USAGE)]
        cache.set_many({key: ['warm'] for key in keys})
        return keys

    def test_matching_oib_never_falls_back_or_evicts_on_repeated_logins(self):
        # Neither an email-domain match nor the SAML organization name may
        # override the institution already resolved by OIB.
        for email_match in (False, True):
            with self.subTest(email_match=email_match):
                if email_match:
                    models.CrorisInstitutions.objects.create(
                        name_short='Email institution', contact_web='https://example.org', active=True)
                keys = self.warm()
                for _ in range(2):
                    user = models.User.objects.get(pk=self.user.pk)
                    self.backend._update_user(user, self.attributes, self.mapping, force_save=True)
                    update_last_login(None, user)
                    user.refresh_from_db()
                    self.assertEqual(user.person_institution, 'Canonical institution')
                    self.assertEqual(cache.get_many(keys), {key: ['warm'] for key in keys})

    def test_real_institution_change_invalidates_once(self):
        self.institution.name_short = 'Renamed institution'
        self.institution.save()
        keys = self.warm()
        self.backend._update_user(self.user, self.attributes, self.mapping)
        self.user.refresh_from_db()
        self.assertEqual(self.user.person_institution, 'Renamed institution')
        self.assertEqual(cache.get_many(keys), {})
        keys = self.warm()
        self.backend._update_user(self.user, self.attributes, self.mapping)
        self.assertEqual(cache.get_many(keys), {key: ['warm'] for key in keys})

    def test_unchanged_automatic_profile_does_not_force_save(self):
        with patch.object(self.backend, 'save_user', wraps=self.backend.save_user) as save:
            self.backend._update_user(self.user, self.attributes, self.mapping)
        save.assert_not_called()

    def test_unknown_oib_uses_stable_email_or_saml_fallback(self):
        self.attributes['hrEduOrgOIB'] = ['unknown']
        for email_match in (False, True):
            with self.subTest(email_match=email_match):
                if email_match:
                    models.CrorisInstitutions.objects.create(
                        name_short='Email institution', contact_web='https://example.org', active=True)
                expected = 'Email institution' if email_match else 'Different SAML name'
                self.backend._update_user(self.user, self.attributes, self.mapping)
                self.user.refresh_from_db()
                self.assertEqual(self.user.person_institution, expected)
                keys = self.warm()
                with patch.object(self.backend, 'save_user', wraps=self.backend.save_user) as save:
                    self.backend._update_user(self.user, self.attributes, self.mapping)
                save.assert_not_called()
                self.assertEqual(cache.get_many(keys), {key: ['warm'] for key in keys})

    def test_edugain_type_change_invalidates_once_and_manual_values_survive(self):
        self.backend.idp_entityid = 'https://edugain.example/idp'
        keys = self.warm()
        self.backend._update_user(self.user, self.attributes, self.mapping)
        self.user.refresh_from_db()
        self.assertEqual(self.user.person_type, 'foreign')
        self.assertEqual(cache.get_many(keys), {})
        keys = self.warm()
        self.backend._update_user(self.user, self.attributes, self.mapping, force_save=True)
        self.assertEqual(cache.get_many(keys), {key: ['warm'] for key in keys})

        self.user.person_type = 'manual'
        self.user.person_institution = 'Manual institution'
        self.user.person_type_manual_set = True
        self.user.person_institution_manual_set = True
        self.user.save()
        keys = self.warm()
        self.backend._update_user(self.user, self.attributes, self.mapping, force_save=True)
        self.user.refresh_from_db()
        self.assertEqual(self.user.person_type, 'manual')
        self.assertEqual(self.user.person_institution, 'Manual institution')
        self.assertEqual(cache.get_many(keys), {key: ['warm'] for key in keys})
