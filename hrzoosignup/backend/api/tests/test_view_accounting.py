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
            response.data, [
                {
                    "user": "user1",
                    "project": "project-1",
                    "resource_name": "supek",
                    "jobid": "1",
                    "walltime": 392,
                    "ncpus": "4",
                    "start_time": 1717845508,
                    "end_time": 1717849428,
                    "queue": "gpu",
                    "wait_time": 2,
                    "qtime": 1717796832,
                    "ngpus": "2"
                },
                {
                    "user": "user1",
                    "project": "project-1",
                    "resource_name": 'supek',
                    "jobid": "2",
                    "walltime": 10,
                    "ncpus": "18",
                    "start_time": 1716001512,
                    "end_time": 1716001522,
                    "queue": "queue1",
                    "wait_time": 2,
                    "qtime": 0
                }
            ]
        )
