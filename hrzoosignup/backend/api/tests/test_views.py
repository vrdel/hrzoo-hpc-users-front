import datetime

from backend import models
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIRequestFactory
from rest_framework_api_key.models import APIKey

from .test_utils import create_mock_db


class ResourceUsageAPITests(TestCase):
    def setUp(self):
        create_mock_db()

        name, key = APIKey.objects.create_key(name="test")
        self.token = key

        self.project1 = models.Project.objects.get(identifier="project-1")
        self.project2 = models.Project.objects.get(identifier="project-2")
        self.project3 = models.Project.objects.get(identifier="project-3")
        self.project4 = models.Project.objects.get(identifier="project-4")
        self.project5 = models.Project.objects.get(identifier="project-5")
        self.user1 = models.User.objects.get(person_username="adent")
        self.user2 = models.User.objects.get(person_username="tmcmilla")

        self.factory = APIRequestFactory()

    def test_post_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_user_uniqueid(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_multiple_users(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "tmcmilla",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 11)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        usage3 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12843"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })
        self.assertEqual(usage3.user, self.user2)
        self.assertEqual(usage3.project, self.project3)
        self.assertEqual(
            usage3.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1720520659),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage3.accounting_record, {
            "jobid": "12843",
            "walltime": "13",
            "ncpus": "2",
            "start_time": "1720520646",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 0.0072,
            "gpuh": 0
        })

    def test_post_data_unique_id_multiple_users(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "user454@fer.hr",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 11)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        usage3 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12843"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })
        self.assertEqual(usage3.user, self.user2)
        self.assertEqual(usage3.project, self.project3)
        self.assertEqual(
            usage3.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1720520659),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage3.accounting_record, {
            "jobid": "12843",
            "walltime": "13",
            "ncpus": "2",
            "start_time": "1720520646",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 0.0072,
            "gpuh": 0
        })

    def test_post_data_nonexisting_user(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"], "User nonexisting not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })

    def test_post_data_nonexisting_user_uniqueid(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting199@fer.hr",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "User nonexisting199@fer.hr not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })

    def test_post_data_multiple_nonexisting_user(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "nonexisting1",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting2",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "Users nonexisting1, nonexisting2 not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 9)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })

    def test_post_data_multiple_nonexisting_user_uniqueids(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "nonexisting1@fer.hr",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "user119@fer.hr",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting2@fer.hr",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "Users nonexisting1@fer.hr, nonexisting2@fer.hr not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 9)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })

    def test_post_data_nonexisting_project(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "nonexisting-project",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "Project nonexisting-project not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 9)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0
        })

    def test_post_data_nonexisting_user_and_project(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "nonexisting-project",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "Project nonexisting-project not found; user nonexisting not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 9)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })

    def test_post_data_without_project(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": None,
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project2)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_without_project_another_resource(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=galaxy",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": None,
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project5)
        self.assertEqual(usage1.resource_name, "galaxy")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "galaxy")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_without_user(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": None,
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, None)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_without_user_another_resource(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=galaxy",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": None,
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, None)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "galaxy")
        self.assertEqual(
            usage1.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2",
            "cpuh": 4.3556,
            "gpuh": 2.1778
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "galaxy")
        self.assertEqual(
            usage2.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1716001522),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "ngpus": None,
            "start_time": "1716001512",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": "",
            "cpuh": 0.05,
            "gpuh": 0.
        })

    def test_post_data_wrong_resource(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=mrkva",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            format="json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "12345",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "project-1",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    },
                    {
                        "user": "adent",
                        "jobid": "12346",
                        "walltime": "10",
                        "ncpus": "18",
                        "project": "project-1",
                        "start_time": "1716001512",
                        "end_time": "1716001522",
                        "queue": "queue1",
                        "wait_time": "2",
                        "qtime": ""
                    },
                    {
                        "user": "nonexisting",
                        "jobid": "12843",
                        "walltime": "13",
                        "ncpus": "2",
                        "project": "project-3",
                        "start_time": "1720520646",
                        "end_time": "1720520659",
                        "queue": "queue2",
                        "wait_time": "4",
                        "qtime": "8"
                    }
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            request.data["status"]["message"], "Nonexisting resource"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)

    def test_post_jupyter_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=jupyter",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "user119@fer.hr",
                        "jupyter_cpu_h": 17.17,
                        "jupyter_gpu_h": 0,
                        "end_time": 1727906399
                    },
                    {
                        "user": "user454@fer.hr",
                        "jupyter_cpu_h": 0.73,
                        "jupyter_gpu_h": 0.18,
                        "end_time": 1727906399
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 10)
        jupyter_usage = models.ResourceUsage.objects.filter(
            resource_name="jupyter"
        )
        self.assertEqual(len(jupyter_usage), 2)
        usage1 = [
            usage for usage in jupyter_usage if usage.user == self.user1
        ][0]
        usage2 = [
            usage for usage in jupyter_usage if usage.user == self.user2
        ][0]
        self.assertEqual(usage1.project, self.project5)
        self.assertEqual(usage1.resource_name, "jupyter")
        self.assertEqual(
            usage1.end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "jupyter_cpu_h": 17.17,
            "jupyter_gpu_h": 0
        })
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "jupyter")
        self.assertEqual(
            usage2.end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "jupyter_cpu_h": 0.73,
            "jupyter_gpu_h": 0.18
        })

    def test_post_jupyter_data_without_end_time_entry(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=jupyter",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "user119@fer.hr",
                        "jupyter_cpu_h": 17.17,
                        "jupyter_gpu_h": 0,
                    },
                    {
                        "user": "user454@fer.hr",
                        "jupyter_cpu_h": 0.73,
                        "jupyter_gpu_h": 0.18,
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            request.data["status"]["message"], "Missing 'end_time' field"
        )

    def test_post_cloud_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 8)
        request = self.client.post(
            "/api/v1/accounting/records?resource=cloud",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "project": "project-3",
                        "cpuh": 2304,
                        "gpuh": 24,
                        "end_time": 1727906399
                    },
                    {
                        "project": "project-4",
                        "cpuh": 3072,
                        "end_time": 1727906399
                    },
                    {
                        "project": "project-1",
                        "gpuh": 72,
                        "end_time": 1727906399
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 11)
        cloud_usage = models.ResourceUsage.objects.filter(
            resource_name="cloud"
        )
        self.assertEqual(len(cloud_usage), 3)
        usage1 = [
            usage for usage in cloud_usage if usage.project == self.project3
        ][0]
        usage2 = [
            usage for usage in cloud_usage if usage.project == self.project4
        ][0]
        usage3 = [
            usage for usage in cloud_usage if usage.project == self.project1
        ][0]
        self.assertEqual(usage1.user, None)
        self.assertEqual(usage1.resource_name, "cloud")
        self.assertEqual(
            usage1.end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage1.accounting_record, {
            "cpuh": 2304,
            "gpuh": 24
        })
        self.assertEqual(usage2.user, None)
        self.assertEqual(usage2.resource_name, "cloud")
        self.assertEqual(
            usage2.end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2.accounting_record, {
            "cpuh": 3072,
            "gpuh": None
        })
        self.assertEqual(usage3.user, None)
        self.assertEqual(usage3.resource_name, "cloud")
        self.assertEqual(
            usage3.end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage3.accounting_record, {
            "gpuh": 72,
            "cpuh": None
        })

    def test_get_jobids(self):
        request1 = self.client.get(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"}
        )
        request2 = self.client.get(
            "/api/v1/accounting/records?resource=padobran",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"}
        )
        self.assertEqual(request1.status_code, status.HTTP_200_OK)
        self.assertEqual(request2.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [r for r in request1.data],
            ["1", "2", "3", "4", "5", "6"]
        )
        self.assertEqual([r for r in request2.data], ["12843"])
