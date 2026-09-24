from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.core.cache import cache
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.test import SimpleTestCase, override_settings

from backend import cache_invalidation, models
from backend.api.internal import (
    view_accounting, view_projects, view_sshkeys, view_userproject, view_users,
)
from backend.management.commands import cache_usage, projects, users
from backend.usage_cache import project_user_usage_key, user_usage_key


@override_settings(CACHES={
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'caching-regressions'},
}, EMAIL_SEND=False)
class CacheRegressionTests(SimpleTestCase):
    databases = {'default'}

    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.user = SimpleNamespace(username='login@example.org',
                                    person_username='cluster', pk=1,
                                    is_staff=True, is_superuser=False)
        self.request = SimpleNamespace(user=self.user)

    def test_invalidation_waits_for_outer_commit(self):
        cache.set('projects-get-all', ['old'])
        with transaction.atomic():
            with transaction.atomic():
                cache_invalidation.membership_changed()
            self.assertEqual(cache.get('projects-get-all'), ['old'])
        self.assertIsNone(cache.get('projects-get-all'))

    def test_rollback_preserves_cached_response(self):
        cache.set('projects-get-all', ['old'])
        with self.assertRaises(ValueError):
            with transaction.atomic():
                cache_invalidation.ssh_key_changed()
                raise ValueError('rollback')
        self.assertEqual(cache.get('projects-get-all'), ['old'])

    def test_user_signals_invalidate_staff_and_embedded_user_responses(self):
        for signal in (post_save, post_delete):
            with self.subTest(signal=signal):
                cache.set_many({key: ['old'] for key in cache_invalidation.USER_ENTRIES})
                signal.send(sender=models.User, instance=self.user,
                            using='default', raw=False, created=False)
                for key in cache_invalidation.USER_ENTRIES:
                    self.assertIsNone(cache.get(key))

    def test_project_extension_and_calendar_dependencies(self):
        for invalidate in (cache_invalidation.project_changed,
                           cache_invalidation.project_extension_changed,
                           cache_invalidation.project_calendar_changed):
            with self.subTest(invalidate=invalidate):
                cache.set_many({key: ['old'] for key in cache_invalidation.MEMBERSHIP_ENTRIES})
                invalidate()
                for key in cache_invalidation.MEMBERSHIP_ENTRIES:
                    self.assertIsNone(cache.get(key))
        cache.set('projectsextends-get-all', ['old'])
        cache_invalidation.project_extension_changed()
        self.assertIsNone(cache.get('projectsextends-get-all'))

    def test_research_submission_uses_the_persons_croris_snapshot(self):
        self.user.person_oib = '12345678901'
        self.request.data = {'croris_id': 1}
        cache.set('12345678901_croris', {'person_info': {'lead_status': False}})
        with patch.object(models.Project.objects, 'get',
                          side_effect=models.Project.DoesNotExist):
            response = view_projects.ProjectsResearch().post(self.request)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['status']['message'],
                         'Not registered leader of any project in CroRIS')

    def test_ssh_deletion_invalidates_embedded_project_users(self):
        self.request.data = {'name': 'key'}
        cache.set('projects-get-all', ['old'])
        with patch.object(view_sshkeys.SSHPublicKey.objects, 'filter') as keys:
            response = view_sshkeys.SshKeys().delete(self.request)
        keys.return_value.get.return_value.delete.assert_called_once()
        self.assertEqual(response.status_code, 204)
        self.assertIsNone(cache.get('projects-get-all'))

    def test_partial_membership_batch_invalidates_successful_writes(self):
        self.request.data = [{'value': 'one'}, {'value': 'two'}]
        user = SimpleNamespace(username='one', person_oib='123')
        cache.set('projects-get-all', ['old'])
        with patch.object(view_userproject, 'get_user_model') as user_model, \
                patch.object(models.Project.objects, 'get'), \
                patch.object(models.Role.objects, 'get'), \
                patch.object(models, 'UserProject') as membership:
            user_model.return_value.objects.filter.return_value = [user, user]
            membership.objects.filter.side_effect = [[], [Mock()]]
            response = view_userproject.UsersProjectsInternal().post(
                self.request, projiddb=1)
        self.assertEqual(response.status_code, 400)
        membership.return_value.save.assert_called_once()
        self.assertIsNone(cache.get('projects-get-all'))

    def test_project_command_invalidates_after_saving(self):
        cache.set('projects-get-all', ['old'])
        project = Mock(identifier='project-1')
        project.save.side_effect = lambda: self.assertEqual(
            cache.get('projects-get-all'), ['old'])
        with patch.object(models.Project.objects, 'get', return_value=project), \
                patch.object(models.State.objects, 'get'):
            command = projects.Command()
            command.stdout = Mock()
            command._project_update({'identifier': 'project-1', 'state': 'approve'})
        project.save.assert_called_once()
        self.assertIsNone(cache.get('projects-get-all'))

    def test_command_membership_removal_invalidates_before_exit(self):
        cache.set('projects-get-all', ['old'])
        command = users.Command()
        command.stdout = Mock()
        with patch.object(models.User.objects, 'get', return_value=self.user), \
                patch.object(models.UserProject.objects, 'get') as membership:
            with self.assertRaises(SystemExit) as exited:
                command._user_delete({'username': self.user.username,
                                      'keyname': None, 'project': 'project-1'})
        self.assertEqual(exited.exception.code, 0)
        membership.return_value.delete.assert_called_once()
        self.assertIsNone(cache.get('projects-get-all'))

    def test_empty_user_lists_are_cache_hits(self):
        for view, key in ((view_users.UsersInfo, 'usersinfo-get'),
                          (view_users.UsersInfoOps, 'usersinfo-ops-get'),
                          (view_users.UsersInfoInactive, 'usersinfoinactive-get')):
            with self.subTest(view=view):
                cache.set(key, [])
                with patch.object(view_users, 'get_user_model') as model, \
                        patch.object(models.User.objects, 'filter') as query:
                    self.assertEqual(view().get(self.request).data, [])
                model.assert_not_called()
                query.assert_not_called()

    def test_no_partial_user_list_is_cached_if_build_fails(self):
        with patch.object(view_users, 'get_user_model') as user_model, \
                patch.object(models.Role.objects, 'get'), \
                patch.object(models.UserProject.objects, 'filter') as memberships, \
                patch.object(models.SSHPublicKey.objects, 'filter', return_value=[]):
            user_model.return_value.objects.all.return_value = [self.user, self.user]
            memberships.side_effect = [[], RuntimeError('builder failed')]
            with self.assertRaises(RuntimeError):
                view_users.UsersInfo().get(self.request)
        self.assertIsNone(cache.get('usersinfo-get'))

    def test_zero_users_stores_a_complete_empty_response(self):
        with patch.object(view_users, 'get_user_model') as user_model, \
                patch.object(models.Role.objects, 'get'):
            user_model.return_value.objects.all.return_value = []
            self.assertEqual(view_users.UsersInfo().get(self.request).data, [])
        self.assertEqual(cache.get('usersinfo-get'), [])

    def test_cached_staff_list_does_not_bypass_permission_check(self):
        cache.set('usersinfo-ops-get', ['private'])
        self.user.is_staff = False
        self.assertEqual(view_users.UsersInfoOps().get(self.request).status_code, 401)

    def test_usage_warmer_uses_login_identity_and_replaces_empty_results(self):
        cache.set(user_usage_key(self.user.username), {'old': 1})
        cache.set(project_user_usage_key(self.user.username), {'old': 1})
        with patch.object(cache_usage.models.User.objects, 'all') as users, \
                patch.object(cache_usage, 'usage4user', return_value={}) as personal, \
                patch.object(cache_usage, 'usage4project_per_user', return_value={}) as project, \
                patch.object(cache_usage, '_is_user_lead', return_value=True):
            users.return_value.iterator.return_value = [self.user]
            cache_usage.Command().handle()
        personal.assert_called_once_with(self.user.username)
        project.assert_called_once_with(self.user.username)
        self.assertEqual(cache.get(user_usage_key(self.user.username)), {})
        self.assertEqual(cache.get(project_user_usage_key(self.user.username)), {})
        with patch.object(view_accounting, 'usage4user') as personal, \
                patch.object(view_accounting, 'usage4project_per_user') as project, \
                patch.object(view_accounting, '_is_user_lead', return_value=True):
            self.assertEqual(view_accounting.ResourceUsage().get(self.request).data, {})
            self.assertEqual(view_accounting.ProjectUsagePerUser().get(self.request).data, {})
        personal.assert_not_called()
        project.assert_not_called()

    def test_former_leader_cache_is_removed_and_permissions_are_live(self):
        cache.set(project_user_usage_key(self.user.username), {'private': 1})
        with patch.object(view_accounting, '_is_user_lead', return_value=False):
            self.assertEqual(view_accounting.ProjectUsagePerUser().get(self.request).status_code, 401)
        with patch.object(cache_usage.models.User.objects, 'all') as users, \
                patch.object(cache_usage, 'usage4user', return_value={}), \
                patch.object(cache_usage, '_is_user_lead', return_value=False):
            users.return_value.iterator.return_value = [self.user]
            cache_usage.Command().handle()
        self.assertIsNone(cache.get(project_user_usage_key(self.user.username)))

    def test_usage_keys_require_an_account(self):
        for builder in (user_usage_key, project_user_usage_key):
            with self.assertRaises(ValueError):
                builder('')
