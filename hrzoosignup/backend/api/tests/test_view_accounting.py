import datetime
from unittest.mock import patch

from backend import models
from backend.api.internal import views
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from .test_utils import create_mock_db


class ResourceUsageTests(TestCase):
    def setUp(self):
        create_mock_db()
        self.view = views.ResourceUsage.as_view()
        self.factory = APIRequestFactory()
        self.user = models.User.objects.get(person_username="adent")

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data_per_user(self, mock_date_today):
        mock_date_today.return_value = datetime.date(2024, 8, 22)
        request = self.factory.get(
            "/api/v1/internal/accounting/records"
        )
        force_authenticate(request, user=self.user)
        response = self.view(request)
        self.assertEqual(
            response.data, {
                "supek": {
                    "cpuh": [
                        {
                            "month": "02/2024",
                            "project-1": 1
                        },
                        {
                            "month": "03/2024",
                            "project-1": 1
                        },
                        {
                            "month": "04/2024",
                            "project-1": 1
                        },
                        {
                            "month": "05/2024",
                            "project-1": 1,
                            "project-2": 117,
                            "project-4": 1
                        },
                        {
                            "month": "06/2024",
                            "project-1": 2,
                            "project-2": 117,
                            "project-4": 1
                        },
                        {
                            "month": "07/2024",
                            "project-1": 2,
                            "project-2": 117
                        },
                        {
                            "month": "08/2024",
                            "project-2": 117
                        }
                    ],
                    "gpuh": [
                        {
                            "month": "02/2024",
                            "project-1": 0
                        },
                        {
                            "month": "03/2024",
                            "project-1": 0
                        },
                        {
                            "month": "04/2024",
                            "project-1": 0
                        },
                        {
                            "month": "05/2024",
                            "project-1": 0
                        },
                        {
                            "month": "06/2024",
                            "project-1": 1
                        },
                        {
                            "month": "07/2024",
                            "project-1": 1,
                            "project-2": 0
                        },
                        {
                            "month": "08/2024",
                            "project-2": 0
                        }
                    ]
                }
            }
        )

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data_for_user_without_usage_records(self, mock_date_today):
        mock_date_today.return_value = datetime.date(2024, 8, 22)
        user = models.User.objects.get(person_username="fprefect")
        request = self.factory.get(
            "/api/v1/internal/accounting/records"
        )
        force_authenticate(request, user=user)
        response = self.view(request)
        self.assertEqual(response.data, {})
