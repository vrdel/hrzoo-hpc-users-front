import datetime
from types import SimpleNamespace

import pandas as pd
from django.test import SimpleTestCase

from backend.api.internal import view_accounting as accounting


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
