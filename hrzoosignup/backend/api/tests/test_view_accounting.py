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
        self.user = models.User.objects.get(person_username="user1")

    def test_get_data_per_user(self):
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
                            "month": "05/2024",
                            "project-1": 0.05,
                            "project-2": 117.115
                        },
                        {
                            "month": "06/2024",
                            "project-1": 0.4356,
                        }
                    ],
                    "gpuh": [
                        {
                            "month": "06/2024",
                            "project-1": 1.5889
                        }
                    ]
                }
            }
        )
