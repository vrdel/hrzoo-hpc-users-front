import datetime
from types import SimpleNamespace
from unittest.mock import patch

import pandas as pd
from django.core.cache import cache
from django.test import SimpleTestCase, TestCase, override_settings

from backend import models
from backend.api.internal import view_accounting as accounting
from backend.caching import entries
from backend.management.commands.cache_usage import Command

from .test_utils import create_mock_db


class UsageAggregationTests(SimpleTestCase):
    def frame(self, rows):
        defaults = {
            'project': 'project', 'resource': 'supek', 'user': 'member',
            'project_start': datetime.date(2024, 1, 1),
            'project_end': datetime.date(2024, 1, 31), 'bogus_end': None,
            'end_time': pd.Timestamp('2024-01-31T23:59:00Z'),
            'cpuh': 0, 'gpuh': 0, 'jupyter_cpuh': 0, 'jupyter_gpuh': 0,
        }
        return pd.DataFrame([{**defaults, **row} for row in rows])

    def test_fractional_threshold_nulls_and_extended_end_date(self):
        df = self.frame([
            {'cpuh': .6, 'gpuh': .5, 'bogus_end': datetime.date(2024, 2, 29)},
            {'cpuh': .6, 'gpuh': .5, 'bogus_end': datetime.date(2024, 2, 29)},
            {'cpuh': None, 'gpuh': None},
        ])
        result = accounting._generate_usage(
            df, [datetime.date(2024, month, 1) for month in (1, 2, 3)])
        self.assertEqual(result, {'supek': {
            'cumulative': {'cpuh': [{'month': '01/2024', 'project': 1},
                                    {'month': '02/2024', 'project': 1},
                                    {'month': '03/2024'}]},
            'monthly': {'cpuh': [{'month': '01/2024', 'project': 1},
                                 {'month': '02/2024'}, {'month': '03/2024'}]},
        }})

    def test_project_start_and_end_boundaries(self):
        df = self.frame([{'cpuh': 3, 'project_start': datetime.date(2024, 2, 1),
                         'project_end': datetime.date(2024, 2, 29)},
                        {'cpuh': 2, 'end_time': pd.Timestamp('2024-02-01T00:00:00Z'),
                         'project_start': datetime.date(2024, 2, 1),
                         'project_end': datetime.date(2024, 2, 29)}])
        result = accounting._generate_usage(
            df, [datetime.date(2024, month, 1) for month in (1, 2, 3)])['supek']
        self.assertEqual(result['cumulative']['cpuh'], [
            {'month': '01/2024'}, {'month': '02/2024', 'project': 5}, {'month': '03/2024'}])
        self.assertEqual(result['monthly']['cpuh'][1], {'month': '02/2024', 'project': 2})

    def test_resource_rules_and_duplicate_display_names(self):
        df = self.frame([
            {'resource': 'jupyter', 'cpuh': 100, 'jupyter_cpuh': 2, 'jupyter_gpuh': 3},
            {'resource': 'padobran', 'cpuh': 2, 'gpuh': 5},
            {'resource': 'cloud', 'cpuh': 2},
            {'resource': 'supek', 'cpuh': 2},
            {'resource': 'supek', 'user': 'other', 'cpuh': 3},
        ])
        dates = [datetime.date(2024, 1, 1)]
        totals = accounting._generate_usage(df, dates)
        self.assertEqual(totals['jupyter']['monthly']['cpuh'][0]['project'], 2)
        self.assertEqual(totals['jupyter']['monthly']['gpuh'][0]['project'], 3)
        self.assertNotIn('gpuh', totals['padobran']['monthly'])
        users = [SimpleNamespace(person_username=name, first_name='Same', last_name='Name')
                 for name in ('member', 'other')]
        per_user = accounting._generate_usage(df, dates, users, per_user=True)
        self.assertNotIn('cloud', per_user)
        self.assertEqual(per_user['supek']['monthly']['cpuh'][0]['Same Name'], 3)


@override_settings(CACHES={'default': {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'LOCATION': 'usage-performance-tests',
}})
class UsageQueryTests(TestCase):
    def setUp(self):
        create_mock_db()
        cache.clear()
        self.addCleanup(cache.clear)
        self.user = models.User.objects.get(person_username='adent')
        self.today = datetime.datetime(2024, 8, 22, tzinfo=datetime.timezone.utc)

    def test_combined_leader_calculation_reuses_records_and_members(self):
        with patch.object(accounting, 'date_today', return_value=self.today):
            expected = (accounting.usage4project_per_user(self.user.username),
                        accounting.usage4project(self.user.username))
            with self.assertNumQueries(3):
                actual = accounting.usage4leader(self.user.username)
        self.assertEqual(actual, expected)
        self.assertTrue(actual[0])
        self.assertTrue(actual[1])

    def test_personal_usage_fetches_values_and_mapping_once(self):
        with patch.object(accounting, 'date_today', return_value=self.today), self.assertNumQueries(2):
            self.assertTrue(accounting.usage4user(self.user.username))

    def test_warmer_classifies_leaders_in_one_query(self):
        leaders = set(models.UserProject.objects.filter(role__name='lead')
                      .values_list('user__username', flat=True))
        users = set(models.User.objects.values_list('username', flat=True))
        with patch('backend.management.commands.cache_usage.usage4user', return_value={}) as personal, \
                patch('backend.management.commands.cache_usage.usage4leader', return_value=({}, {})) as leader, \
                patch('backend.management.commands.cache_usage.store.set') as store_set, \
                self.assertNumQueries(1):
            Command().handle()
        self.assertEqual({call.args[0] for call in personal.call_args_list}, users)
        self.assertEqual({call.args[0] for call in leader.call_args_list}, leaders)
        self.assertEqual(leader.call_count, len(leaders))
        self.assertEqual(sum(call.args[0] == entries.PROJECT_USAGE
                             for call in store_set.call_args_list), len(leaders))
