from backend.dashboard.indicators import DashboardIndicators
from django.test import TestCase

from .test_utils import create_mock_db


class DashboardTests(TestCase):
    def setUp(self):
        create_mock_db()
        self.indicators = DashboardIndicators(month=5, year=2024)

    def test_institutions(self):
        self.assertEqual(
            self.indicators.institutions(), {
                "Fakultet elektrotehnike i računarstva": {
                    "oib": "01234567890",
                    "mbu": "036"
                },
                "Prirodoslovno-matematički fakultet, Zagreb": {
                    "oib": "12345678901",
                    "mbu": "119"
                },
                "Daily Bugle": {
                    "oib": "",
                    "mbu": ""
                }
            }
        )

    def test_projects(self):
        self.assertEqual(
            self.indicators.projects(
                institution="Fakultet elektrotehnike i računarstva"
            ),
            2
        )
