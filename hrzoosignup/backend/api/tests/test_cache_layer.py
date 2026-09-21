from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.contrib.admin import ModelAdmin, AdminSite
from django.core.cache import cache
from django.db import transaction
from django.test import TransactionTestCase, override_settings

from backend import models
from backend.caching import entries, invalidation, store
from backend.api.internal.view_croris import CroRISInfo, with_current_approvals
from backend.api.internal.view_projects import Projects
from backend.api.internal import view_accounting


@override_settings(CACHES={'default': {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'LOCATION': 'cache-layer-tests',
    'KEY_PREFIX': 'hzsi',
}})
class CacheLayerTests(TransactionTestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)

    def user(self, username='member'):
        return models.User.objects.create(username=username, status=True,
                                          mailinglist_subscribe=False)

    def project(self):
        return models.Project.objects.create(identifier='project', name='Before',
                                              is_active=True)

    def test_empty_values_and_none_are_hits(self):
        for value in ([], {}, None):
            cache.clear()
            loader = Mock(return_value=value)
            self.assertEqual(store.remember(entries.PROJECTS, loader), value)
            self.assertEqual(store.remember(entries.PROJECTS, loader), value)
            loader.assert_called_once_with()

    def test_failed_loader_is_not_cached(self):
        with self.assertRaises(ValueError):
            store.remember(entries.PROJECTS, Mock(side_effect=ValueError('failure')))
        self.assertEqual(store.remember(entries.PROJECTS, lambda: ['complete']), ['complete'])

    def test_rollback_never_publishes_or_reads_shared_response(self):
        store.set(entries.PROJECTS, ['committed'])
        with self.assertRaises(ValueError):
            with transaction.atomic():
                self.assertEqual(store.remember(entries.PROJECTS, lambda: ['local']), ['local'])
                invalidation.project_changed()
                raise ValueError('rollback')
        self.assertEqual(store.get(entries.PROJECTS), ['committed'])

    def test_invalid_and_unsafe_parameters(self):
        for params in ({}, {'account': ''}, {'account': None}, {'wrong': 'user'}):
            with self.assertRaises(ValueError):
                entries.USER_USAGE.key(**params)
        self.assertEqual(entries.USER_USAGE.key(account='user'), 'usage:user:user')
        self.assertEqual(cache.make_key(entries.USER_USAGE.key(account='user')),
                         'hzsi:1:usage:user:user')
        for account in ('a' * 300, 'line\nbreak', 'space name'):
            key = entries.USER_USAGE.key(account=account)
            self.assertLess(len(key), 200)
            self.assertFalse(any(c.isspace() for c in key))
            self.assertEqual(key, entries.USER_USAGE.key(account=account))

    def test_outage_does_not_break_builder_or_commit(self):
        with patch.object(store.cache, 'get', side_effect=OSError), \
                patch.object(store.cache, 'set', side_effect=OSError), \
                patch.object(store.cache, 'delete_many', side_effect=OSError):
            with self.assertLogs('backend.caching.store', level='WARNING'):
                self.assertEqual(store.remember(entries.PROJECTS, lambda: []), [])
                with transaction.atomic():
                    invalidation.project_changed()

    def test_rename_evicts_old_and_new_usage_on_commit(self):
        user = self.user('old')
        for account in ('old', 'new'):
            store.set(entries.USER_USAGE, ['stale'], account=account)
        with transaction.atomic():
            user.username = 'new'
            user.save()
            self.assertEqual(cache.get(entries.USER_USAGE.key(account='old')), ['stale'])
        for account in ('old', 'new'):
            self.assertIsNone(store.get(entries.USER_USAGE, account=account))

    def test_membership_changes_refresh_project_response_and_usage(self):
        user = self.user()
        project = self.project()
        role = models.Role.objects.create(name='lead')
        request = SimpleNamespace(user=SimpleNamespace(is_staff=True, is_superuser=False))
        view = Projects()
        before = view.get(request, specific='all').data
        self.assertEqual(before[0]['users'], [])
        store.set(entries.PROJECT_USER_USAGE, ['old'], account=user.username)
        models.UserProject.objects.create(user=user, project=project, role=role)
        after = view.get(request, specific='all').data
        self.assertEqual(after[0]['users'][0]['username'], user.username)
        self.assertIsNone(store.get(entries.PROJECT_USER_USAGE, account=user.username))

    def test_bulk_usage_insert_invalidates_member_and_leader(self):
        user = self.user()
        leader = self.user('leader')
        project = self.project()
        role = models.Role.objects.create(name='lead')
        models.UserProject.objects.create(user=leader, project=project, role=role)
        for account in (user.username, leader.username):
            store.set(entries.USER_USAGE, ['old'], account=account)
            store.set(entries.PROJECT_USER_USAGE, ['old'], account=account)
        records = [models.ResourceUsage(user=user, project=project)]
        with transaction.atomic():
            models.ResourceUsage.objects.bulk_create(records)
            invalidation.usage_records_changed(records)
        for account in (user.username, leader.username):
            self.assertIsNone(store.get(entries.USER_USAGE, account=account))
            self.assertIsNone(store.get(entries.PROJECT_USER_USAGE, account=account))

    def test_usage_requests_share_fills_and_rebuild_after_invalidation(self):
        user = self.user()
        other = self.user('other')
        project = self.project()
        cases = (
            (view_accounting.ResourceUsage, 'usage4user', entries.USER_USAGE),
            (view_accounting.ProjectUsagePerUser, 'usage4project_per_user', entries.PROJECT_USER_USAGE),
        )
        for view, builder, entry in cases:
            for result in ({}, {'usage': 42}):
                with self.subTest(view=view.__name__, result=result):
                    cache.clear()
                    with patch.object(view_accounting, builder, return_value=result) as compute, \
                            patch.object(view_accounting, '_is_user_lead', return_value=True):
                        for _ in range(2):
                            request = SimpleNamespace(user=models.User.objects.get(pk=user.pk))
                            self.assertEqual(view().get(request).data, result)
                        compute.assert_called_once_with(user.username)
                        self.assertEqual(store.get(entry, account=user.username), result)
                        view().get(SimpleNamespace(user=other))
                        self.assertEqual(compute.call_count, 2)
                        # A real usage write evicts this user's cached response.
                        models.ResourceUsage.objects.create(user=user, project=project)
                        self.assertIsNone(store.get(entry, account=user.username))
                        self.assertEqual(view().get(request).data, result)
                        self.assertEqual(compute.call_count, 3)

    def test_cached_leader_usage_still_requires_current_leadership(self):
        user = self.user()
        project = self.project()
        role = models.Role.objects.create(name='lead')
        membership = models.UserProject.objects.create(user=user, project=project, role=role)
        for entry in (entries.PROJECT_USER_USAGE,):
            store.set(entry, {'private': True}, account=user.username)
        membership.delete()
        for entry in (entries.PROJECT_USER_USAGE,):
            self.assertIsNone(store.get(entry, account=user.username))
            # Even a stale cache entry cannot bypass the permission check.
            store.set(entry, {'private': True}, account=user.username)
        for view in (view_accounting.ProjectUsagePerUser,):
            self.assertEqual(view().get(SimpleNamespace(user=user)).status_code, 401)

    def test_admin_project_bulk_deletion_evicts_cascaded_data(self):
        user = self.user()
        project = self.project()
        models.ResourceUsage.objects.create(user=user, project=project)
        store.set(entries.PROJECT_EXTENSIONS, ['old'])
        store.set(entries.USER_USAGE, ['old'], account=user.username)
        ModelAdmin(models.Project, AdminSite()).delete_queryset(None, models.Project.objects.all())
        self.assertIsNone(store.get(entries.PROJECT_EXTENSIONS))
        self.assertIsNone(store.get(entries.USER_USAGE, account=user.username))

    def test_snapshot_approval_flags_follow_current_state(self):
        snapshot = {'projects_lead_info': [{'croris_id': 12, 'is_approved': False}],
                    'projects_associate_info': []}
        state = models.State.objects.create(name='approve')
        project = self.project()
        project.croris_id, project.state = 12, state
        project.save()
        self.assertTrue(with_current_approvals(snapshot)['projects_lead_info'][0]['is_approved'])
        self.assertFalse(snapshot['projects_lead_info'][0]['is_approved'])
        state.name = 'deny'
        state.save()
        self.assertFalse(with_current_approvals(snapshot)['projects_lead_info'][0]['is_approved'])

    def test_remote_snapshot_hit_still_checks_permissions(self):
        store.set(entries.CRORIS_PERSON, {'private': True}, oib='123')
        request = SimpleNamespace(user=SimpleNamespace(is_staff=False, is_superuser=False, username='user'))
        with patch('backend.api.internal.view_croris.CroRISCore') as remote:
            self.assertEqual(CroRISInfo().get(request, target_oib='123').status_code, 401)
        remote.assert_not_called()

    def test_ssh_change_refreshes_embedded_project_user(self):
        user = self.user()
        project = self.project()
        role = models.Role.objects.create(name='lead')
        models.UserProject.objects.create(user=user, project=project, role=role)
        request = SimpleNamespace(user=SimpleNamespace(is_staff=True, is_superuser=False))
        view = Projects()
        self.assertFalse(view.get(request, specific='all').data[0]['users'][0]['sshkeys'])
        models.SSHPublicKey.objects.create(user=user, name='key', public_key='ssh-rsa test')
        self.assertTrue(view.get(request, specific='all').data[0]['users'][0]['sshkeys'])

    def test_staff_rename_refreshes_staff_list(self):
        from backend.api.internal.view_users import UsersInfoOps
        user = self.user()
        user.is_staff = True
        user.save()
        request = SimpleNamespace(user=user)
        self.assertEqual(UsersInfoOps().get(request).data[0]['first_name'], '')
        user.first_name = 'Updated'
        user.save()
        self.assertEqual(UsersInfoOps().get(request).data[0]['first_name'], 'Updated')

    def test_reference_data_and_comment_changes_invalidate_projects(self):
        project = self.project()
        for model, fields in ((models.Role, {'name': 'lead'}),
                              (models.State, {'name': 'approve'}),
                              (models.ProjectType, {'name': 'research'}),
                              (models.StaffComment, {'project': project, 'comment': 'update'})):
            with self.subTest(model=model):
                store.set(entries.PROJECTS, ['old'])
                model.objects.create(**fields)
                self.assertIsNone(store.get(entries.PROJECTS))

    def test_croRIS_snapshot_is_reused_without_storing_approval_flags(self):
        user = self.user()
        user.person_oib = '123'
        user.save()
        request = SimpleNamespace(user=user)
        with patch('backend.api.internal.view_croris.CroRISCore') as remote:
            snapshot = remote.return_value
            snapshot.person_info = {'first_name': 'Remote'}
            snapshot.projects_lead_info = [{'croris_id': 12}]
            snapshot.projects_lead_users = {}
            snapshot.projects_associate_info = []
            snapshot.projects_associate_ids = []
            store.set(entries.PROJECTS, ['old'])
            self.assertEqual(CroRISInfo().get(request).status_code, 200)
            user.refresh_from_db()
            self.assertEqual(user.croris_first_name, 'Remote')
            self.assertIsNone(store.get(entries.PROJECTS))

            # Another tab reads the same snapshot without evicting warmed data.
            for entry in (entries.USERS, entries.PROJECTS, entries.PROJECT_EXTENSIONS):
                store.set(entry, ['warm'])
            store.set(entries.USER_USAGE, ['warm'], account=user.username)
            store.set(entries.PROJECT_USER_USAGE, ['warm'], account=user.username)
            second_request = SimpleNamespace(user=models.User.objects.get(pk=user.pk))
            self.assertEqual(CroRISInfo().get(second_request).status_code, 200)
            for entry in (entries.USERS, entries.PROJECTS, entries.PROJECT_EXTENSIONS):
                self.assertEqual(store.get(entry), ['warm'])
            self.assertEqual(store.get(entries.USER_USAGE, account=user.username), ['warm'])
            self.assertEqual(store.get(entries.PROJECT_USER_USAGE, account=user.username), ['warm'])
            snapshot.fetch.assert_called_once_with()
        self.assertNotIn('is_approved', store.get(entries.CRORIS_PERSON, oib='123')['projects_lead_info'][0])

    def test_history_changes_invalidate_inactive_users(self):
        from django.utils import timezone
        user = self.user()
        store.set(entries.INACTIVE_USERS, ['old'])
        history = models.UserProjectHistory.objects.create(user=user, date_left=timezone.now())
        self.assertIsNone(store.get(entries.INACTIVE_USERS))
        store.set(entries.INACTIVE_USERS, ['old'])
        history.delete()
        self.assertIsNone(store.get(entries.INACTIVE_USERS))

    def test_calendar_command_invalidates_without_model_mutations(self):
        from io import StringIO
        from django.core.management import call_command
        from django.utils import timezone
        project = self.project()
        project.date_start = timezone.localdate()
        project.state = models.State.objects.create(name='approve')
        project.save()
        store.set(entries.PROJECTS, ['yesterday'])
        call_command('invalidate-cache-started-projects', '--yes', stdout=StringIO())
        self.assertIsNone(store.get(entries.PROJECTS))

    def test_explicit_bulk_invalidation_freezes_affected_accounts(self):
        accounts = ['old']
        store.set(entries.USER_USAGE, ['old'], account='old')
        with transaction.atomic():
            invalidation.membership_changed(usage_accounts=accounts)
            accounts[:] = ['different']
        self.assertIsNone(store.get(entries.USER_USAGE, account='old'))
