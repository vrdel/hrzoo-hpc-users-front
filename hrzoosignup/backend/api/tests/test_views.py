import copy
import datetime
from unittest import mock

from backend import models
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIRequestFactory

from .test_utils import create_mock_db


class ResourceUsageAPITests(TestCase):
    def setUp(self):
        create_mock_db()

        hrzoo = models.Organization4APIKey.objects.get(name="hrzoo")
        merlin = models.Organization4APIKey.objects.get(name="merlin")
        name, key = models.MyAPIKey.objects.create_key(
            name="test", organization=hrzoo
        )
        name2, key2 = models.MyAPIKey.objects.create_key(
            name="test2", organization=merlin
        )
        self.token = key
        self.token2 = key2

        self.project1 = models.Project.objects.get(identifier="project-1")
        self.project2 = models.Project.objects.get(identifier="project-2")
        self.project3 = models.Project.objects.get(identifier="project-3")
        self.project4 = models.Project.objects.get(identifier="project-4")
        self.project5 = models.Project.objects.get(identifier="project-5")
        self.project6 = models.Project.objects.get(name="Project name 6")
        self.user1 = models.User.objects.get(person_username="adent")
        self.user2 = models.User.objects.get(person_username="tmcmilla")

        self.factory = APIRequestFactory()

    def test_post_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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

    def test_post_data_different_organization_token(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"},
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
        self.assertEqual(request.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request.json(),
            {"detail": "Authentication credentials were not provided."}
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)

    def test_post_empty_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={"usage": []},
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)

    def test_post_data_user_uniqueid(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 16)
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
        self.assertEqual(usage3.project, self.project5)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 16)
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
        self.assertEqual(usage3.project, self.project5)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 14)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 14)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 14)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 14)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)

    def test_post_jupyter_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
                        "end_time": "1727906399"
                    },
                    {
                        "user": "user454@fer.hr",
                        "jupyter_cpu_h": 0.73,
                        "jupyter_gpu_h": 0.18,
                        "end_time": "1727906399"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 15)
        jupyter_usage = models.ResourceUsage.objects.filter(
            resource_name="jupyter"
        ).order_by("-end_time")
        self.assertEqual(len(jupyter_usage), 5)
        usage1 = [
            usage for usage in jupyter_usage if usage.user == self.user1
        ][0]
        usage2 = [
            usage for usage in jupyter_usage if usage.user == self.user2
        ]
        self.assertEqual(len(usage2), 4)
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
        self.assertEqual(usage2[0].project, self.project1)
        self.assertEqual(usage2[0].resource_name, "jupyter")
        self.assertEqual(
            usage2[0].end_time, timezone.make_aware(
                datetime.datetime(2024, 10, 2, 23, 59, 59),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage2[0].accounting_record, {
            "jupyter_cpu_h": 0.73,
            "jupyter_gpu_h": 0.18
        })

    def test_post_jupyter_data_without_end_time_entry(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
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
            request.data["status"]["message"],
            "end_time: This field is required."
        )

    def test_post_cloud_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
        request = self.client.post(
            "/api/v1/accounting/records?resource=cloud",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "project": "project-3",
                        "end_time": "1727906399",
                        "start_time": "1727733601",
                        "instance_id": "1212121212",
                        "vcpus": "16",
                        "started_at": "1725015063",
                        "ended_at": None,
                        "ngpus": "1",
                        "flavor": "m1.gpu.1"
                    },
                    {
                        "project": "project-4",
                        "end_time": "1727906399",
                        "start_time": "1727733601",
                        "instance_id": "d591480f-6e2b-4817-9c54-b12d0d2d731f",
                        "vcpus": "4",
                        "started_at": "1727782030",
                        "ended_at": None,
                        "flavor": "m1.half.windows"
                    },
                    {
                        "project": "project-5",
                        "end_time": "1727906399",
                        "start_time": "1727733601",
                        "instance_id": "13241243135132",
                        "vcpus": "64",
                        "started_at": "1719313795",
                        "ended_at": "1727761972",
                        "flavor": "m1.medium"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 16)
        cloud_usage = models.ResourceUsage.objects.filter(
            resource_name="cloud"
        )
        self.assertEqual(len(cloud_usage), 5)
        usage1 = [
            usage for usage in cloud_usage if usage.project == self.project3
        ][0]
        usage2 = [
            usage for usage in cloud_usage if usage.project == self.project4
        ][0]
        usage3 = [
            usage for usage in cloud_usage if usage.project == self.project5
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
            "start_time": "1727733601",
            "instance_id": "1212121212",
            "vcpus": "16",
            "started_at": "1725015063",
            "ended_at": None,
            "ngpus": "1",
            "flavor": "m1.gpu.1",
            "cpuh": 767.9911,
            "gpuh": 47.9994
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
            "start_time": "1727733601",
            "instance_id": "d591480f-6e2b-4817-9c54-b12d0d2d731f",
            "vcpus": "4",
            "ngpus": None,
            "started_at": "1727782030",
            "ended_at": None,
            "flavor": "m1.half.windows",
            "cpuh": 138.1878,
            "gpuh": 0
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
            "start_time": "1727733601",
            "instance_id": "13241243135132",
            "vcpus": "64",
            "ngpus": None,
            "started_at": "1719313795",
            "ended_at": "1727761972",
            "flavor": "m1.medium",
            "gpuh": 0,
            "cpuh": 504.3733
        })

    def test_post_data_improper_project_id(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 13)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data={
                "usage": [
                    {
                        "user": "adent",
                        "jobid": "1234566",
                        "walltime": "3920",
                        "ncpus": "4",
                        "project": "123456",
                        "start_time": "1717845508",
                        "end_time": "1717849428",
                        "queue": "gpu",
                        "wait_time": "2",
                        "qtime": "1717796832",
                        "ngpus": "2"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 14)
        usage = models.ResourceUsage.objects.get(
            accounting_record__jobid="1234566"
        )
        self.assertEqual(usage.user, self.user1)
        self.assertEqual(usage.project, self.project6)
        self.assertEqual(usage.resource_name, "supek")
        self.assertEqual(
            usage.end_time,
            timezone.make_aware(
                datetime.datetime.fromtimestamp(1717849428),
                timezone=timezone.get_current_timezone()
            )
        )
        self.assertEqual(usage.accounting_record, {
            "jobid": "1234566",
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

    def test_get_jobids_different_organization_token(self):
        request1 = self.client.get(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"}
        )
        request2 = self.client.get(
            "/api/v1/accounting/records?resource=padobran",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"}
        )
        self.assertEqual(request1.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(request2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request1.json(),
            {"detail": "Authentication credentials were not provided."}
        )
        self.assertEqual(
            request2.json(),
            {"detail": "Authentication credentials were not provided."}
        )


class AccountingUserProjectAPITests(TestCase):
    def setUp(self):
        create_mock_db()

        self.map_realms = [
            {
                "from": "Fakultet elektrotehnike i računarstva",
                "to": "fer.hr"
            },
            {
                "from": "Prirodoslovno-matematički fakultet, Zagreb",
                "to": "pmf.hr"
            },
            {
                "from":
                    "Fakultet elektrotehnike, strojarstva i brodogradnje u "
                    "Splitu",
                "to": "fesb.hr"
            }
        ]

        self.project_identifiers = [
            {
                "field": "project.identifier",
                "from": "Grant agreement ID: ",
                "to": ""
            },
            {
                "field": "project.identifier",
                "from": "/",
                "to": "-"
            },
            {
                "field": "project.identifier",
                "from": " ",
                "to": "-"
            }
        ]

        hrzoo = models.Organization4APIKey.objects.get(name="hrzoo")
        merlin = models.Organization4APIKey.objects.get(name="merlin")
        name, key = models.MyAPIKey.objects.create_key(
            name="test", organization=hrzoo
        )
        name2, key2 = models.MyAPIKey.objects.create_key(
            name="test2", organization=merlin
        )
        self.token = key
        self.token2 = key2

        self.project1 = models.Project.objects.get(identifier="project-1")
        self.project2 = models.Project.objects.get(identifier="project-2")
        self.project3 = models.Project.objects.get(identifier="project-3")
        self.project4 = models.Project.objects.get(identifier="project-4")
        self.project5 = models.Project.objects.get(identifier="project-5")
        self.project6 = models.Project.objects.get(name="Project name 6")

        self.user1 = models.User.objects.get(username="user119@fer.hr")
        self.user2 = models.User.objects.get(username="user454@fer.hr")
        self.user3 = models.User.objects.get(username="user45@fer.hr")
        self.user4 = models.User.objects.get(username="user70@fer.hr")
        self.user5 = models.User.objects.get(username="user42@fer.hr")
        self.user6 = models.User.objects.get(username="user348@fer.hr")
        self.user7 = models.User.objects.get(username="delboy@pmf.hr")
        self.user8 = models.User.objects.get(username="dave@pmf.hr")
        self.user9 = models.User.objects.get(username="uncle_albert@pmf.hr")
        self.user10 = models.User.objects.get(
            username="j.jameson@daily-bugle.com"
        )

    def test_get_user_project(self):
        with self.settings(
                MAP_REALMS=self.map_realms,
                PROJECT_IDENTIFIER_MAP=self.project_identifiers
        ):
            request = self.client.get(
                "/api/v1/accounting/projectsusers?tags=CPU,GPU,BIGMEM,PADOBRAN,"
                "CLOUD,CLOUD-GPU,CLOUD-BIGMEM,JUPYTER",
                **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(
            request.json(), [
                {
                    "id": self.project1.id,
                    "sifra": "project-1",
                    "date_from": "2023-05-01",
                    "date_end": "2024-07-31",
                    "date_approved": "2023-05-03",
                    "type": "research-croris",
                    "name": "Project name 1",
                    "ustanova": {
                        "naziv": "Sveučilište u Zagrebu, Fakultet "
                                 "elektrotehnike i računarstva",
                        "oib": "01234567890",
                        "mbu": "036"
                    },
                    "croris_url":
                        "https://www.croris.hr/projekti/projekt/123456",
                    "science_field": [
                        {
                            "name": "PRIRODNE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Fizika",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "fer.hr",
                    "finance": [
                        {
                            "name": 'Hrvatska zaklada za znanost',
                            "amount": "100",
                            "currency": "EUR"
                        }
                    ],
                    "approved_resources": [
                        "CLOUD-GPU",
                        "CLOUD",
                        "GPU",
                        "CPU",
                        "PADOBRAN",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user1.id,
                            "uid": "user119@fer.hr",
                            "ime": "Arthur",
                            "prezime": "Dent",
                            "mail": "arthur.dent@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user2.id,
                            "uid": "user454@fer.hr",
                            "ime": "Tricia",
                            "prezime": "McMillan",
                            "mail": "trillian@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, "
                                        "Fakultet elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user9.id,
                            "uid": "uncle_albert@pmf.hr",
                            "ime": "Albert",
                            "prezime": "Trotter",
                            "mail": "uncle.albert@biol.pmf.hr",
                            "ustanova":
                                "Prirodoslovno-matematički fakultet, Zagreb"
                        }
                    ]
                },
                {
                    "id": self.project2.id,
                    "sifra": "project-2",
                    "date_from": "2024-05-07",
                    "date_end": "2025-12-31",
                    "date_approved": "2024-06-09",
                    "type": "research-institutional",
                    "name": "Project name 2",
                    "ustanova": {
                        "naziv": "Sveučilište u Zagrebu, Fakultet "
                                 "elektrotehnike i računarstva",
                        "oib": "01234567890",
                        "mbu": "036"
                    },
                    "croris_url": "",
                    "science_field": [
                        {
                            "name": "TEHNIČKE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Računarstvo",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "fer.hr",
                    "finance": [
                        "Sveučilište u Zagrebu, Fakultet elektrotehnike i "
                        "računarstva"
                    ],
                    "approved_resources": [
                        "CPU",
                        "GPU",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user1.id,
                            "uid": "user119@fer.hr",
                            "ime": "Arthur",
                            "prezime": "Dent",
                            "mail": "arthur.dent@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user3.id,
                            "uid": "user45@fer.hr",
                            "ime": "Ford",
                            "prezime": "Prefect",
                            "mail": "ford.prefect@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user4.id,
                            "uid": "user70@fer.hr",
                            "ime": "Zaphod",
                            "prezime": "Beeblebrox",
                            "mail": "zb@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        }
                    ]
                },
                {
                    "id": self.project3.id,
                    "sifra": "project-3",
                    "date_from": "2024-03-01",
                    "date_end": "2025-05-01",
                    "date_approved": "2024-03-07",
                    "type": "thesis",
                    "name": "Project name 3",
                    "ustanova": {
                        "naziv": "Sveučilište u Zagrebu, Fakultet "
                                 "elektrotehnike i računarstva",
                        "oib": "01234567890",
                        "mbu": "036"
                    },
                    "croris_url": "",
                    "science_field": [
                        {
                            "name": "TEHNIČKE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Računarstvo",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "fer.hr",
                    "finance": [
                        "Sveučilište u Zagrebu, Fakultet elektrotehnike i "
                        "računarstva"
                    ],
                    "approved_resources": [
                        "GPU",
                        "CPU",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user5.id,
                            "uid": "user42@fer.hr",
                            "ime": "Marvin",
                            "prezime": "The Paranoid Android",
                            "mail": "marvin@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user6.id,
                            "uid": "user348@fer.hr",
                            "ime": "",
                            "prezime": "",
                            "mail": "",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user10.id,
                            "uid": "j.jameson@daily-bugle.com",
                            "ime": "",
                            "prezime": "",
                            "mail": "j.jameson@daily-bugle.com",
                            "ustanova": "Daily Bugle"
                        }
                    ]
                },
                {
                    "id": self.project4.id,
                    "sifra": "project-4",
                    "date_from": "2024-01-01",
                    "date_end": "2024-06-30",
                    "date_approved": "2024-02-02",
                    "type": "research-croris",
                    "name": "Project name 4",
                    "ustanova": {
                        "naziv": "Prirodoslovno-matematički fakultet, Zagreb",
                        "oib": "12345678901",
                        "mbu": "119"
                    },
                    "croris_url": "https://www.croris.hr/projekti/projekt/666",
                    "science_field": [
                        {
                            "name": "PRIRODNE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Biologija",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "pmf.hr",
                    "finance": [
                        {
                            "name": 'Trotters Independent Traders',
                            "amount": "10",
                            "currency": "GBP"
                        }
                    ],
                    "approved_resources": [
                        "CLOUD-GPU",
                        "CLOUD-CPU",
                        "PADOBRAN",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user7.id,
                            "uid": "delboy@pmf.hr",
                            "ime": "Derek",
                            "prezime": "Trotter",
                            "mail": "delboy@biol.pmf.hr",
                            "ustanova":
                                "Prirodoslovno-matematički fakultet, Zagreb"
                        },
                        {
                            "id": self.user8.id,
                            "uid": "dave@pmf.hr",
                            "ime": "Rodney",
                            "prezime": "Trotter",
                            "mail": "dave@biol.pmf.hr",
                            "ustanova":
                                "Prirodoslovno-matematički fakultet, Zagreb"
                        }
                    ]
                },
                {
                    "id": self.project5.id,
                    "sifra": "project-5",
                    "date_from": "2024-05-01",
                    "date_end": "2025-12-31",
                    "date_approved": "2024-05-03",
                    "type": "practical",
                    "name": "Project name 5",
                    "ustanova": {
                        "naziv": "Sveučilište u Zagrebu, Fakultet "
                                 "elektrotehnike i računarstva",
                        "oib": "01234567890",
                        "mbu": "036"
                    },
                    "croris_url": "",
                    "science_field": [
                        {
                            "name": "TEHNIČKE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Računarstvo",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "fer.hr",
                    "finance": [
                        "Sveučilište u Zagrebu, Fakultet elektrotehnike i "
                        "računarstva"
                    ],
                    "approved_resources": [
                        "PADOBRAN",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user1.id,
                            "uid": "user119@fer.hr",
                            "ime": "Arthur",
                            "prezime": "Dent",
                            "mail": "arthur.dent@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        },
                        {
                            "id": self.user2.id,
                            "uid": "user454@fer.hr",
                            "ime": "Tricia",
                            "prezime": "McMillan",
                            "mail": "trillian@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        }
                    ]
                },                {
                    "id": self.project6.id,
                    "sifra": "123456",
                    "date_from": "2024-05-01",
                    "date_end": "2025-12-31",
                    "date_approved": "2024-05-04",
                    "type": "practical",
                    "name": "Project name 6",
                    "ustanova": {
                        "naziv": "Sveučilište u Zagrebu, Fakultet "
                                 "elektrotehnike i računarstva",
                        "oib": "01234567890",
                        "mbu": "036"
                    },
                    "croris_url": "",
                    "science_field": [
                        {
                            "name": "TEHNIČKE ZNANOSTI",
                            "percent": 100,
                            "scientificfields": [
                                {
                                    "name": "Računarstvo",
                                    "percent": 100
                                }
                            ]
                        }
                    ],
                    "realm": "fer.hr",
                    "finance": [
                        "Sveučilište u Zagrebu, Fakultet elektrotehnike i "
                        "računarstva"
                    ],
                    "approved_resources": [
                        "PADOBRAN",
                        "JUPYTER"
                    ],
                    "users": [
                        {
                            "id": self.user1.id,
                            "uid": "user119@fer.hr",
                            "ime": "Arthur",
                            "prezime": "Dent",
                            "mail": "arthur.dent@fer.hr",
                            "ustanova": "Sveučilište u Zagrebu, Fakultet "
                                        "elektrotehnike i računarstva"
                        }
                    ]
                }
            ]
        )

    def test_get_user_project_with_different_organization_token(self):
        with self.settings(
                MAP_REALMS=self.map_realms,
                PROJECT_IDENTIFIER_MAP=self.project_identifiers
        ):
            request = self.client.get(
                "/api/v1/accounting/projectsusers?tags=CPU,GPU,BIGMEM,PADOBRAN,"
                "CLOUD,CLOUD-GPU,CLOUD-BIGMEM,JUPYTER",
                **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"},
            )
        self.assertEqual(request.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request.json(),
            {"detail": "Authentication credentials were not provided."}
        )


class UserProjectAPITests(TestCase):
    def setUp(self):
        create_mock_db()
        hrzoo = models.Organization4APIKey.objects.get(name="hrzoo")
        merlin = models.Organization4APIKey.objects.get(name="merlin")
        name, key = models.MyAPIKey.objects.create_key(
            name="test", organization=hrzoo
        )
        name2, key2 = models.MyAPIKey.objects.create_key(
            name="test2", organization=merlin
        )
        self.token = key
        self.token2 = key2

        self.project1 = models.Project.objects.get(identifier="project-1")
        self.project2 = models.Project.objects.get(identifier="project-2")
        self.project3 = models.Project.objects.get(identifier="project-3")
        self.project4 = models.Project.objects.get(identifier="project-4")
        self.project5 = models.Project.objects.get(identifier="project-5")
        self.project6 = models.Project.objects.get(name="Project name 6")

        self.user1 = models.User.objects.get(username="user119@fer.hr")
        self.user2 = models.User.objects.get(username="user454@fer.hr")
        self.user3 = models.User.objects.get(username="user45@fer.hr")
        self.user4 = models.User.objects.get(username="user70@fer.hr")
        self.user5 = models.User.objects.get(username="user42@fer.hr")
        self.user6 = models.User.objects.get(username="user348@fer.hr")
        self.user7 = models.User.objects.get(username="delboy@pmf.hr")
        self.user8 = models.User.objects.get(username="dave@pmf.hr")
        self.user9 = models.User.objects.get(username="uncle_albert@pmf.hr")
        self.user10 = models.User.objects.get(
            username="j.jameson@daily-bugle.com"
        )

    def tearDown(self):
        cache.clear()

    def test_get_usersprojects(self):
        request = self.client.get(
            "/api/v1/usersprojects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
        )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(
            request.json(), [
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": "2023-05-03T02:00:00+02:00"
                },
                {
                    "user": {
                        "id": self.user2.id,
                        "person_oib": "22222222222",
                        "first_name": "Tricia",
                        "last_name": "McMillan",
                        "person_mail": "trillian@fer.hr",
                        "person_username": "tmcmilla",
                        "person_type": "",
                        "username": "user454@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user9.id,
                        "person_oib": "99999999999",
                        "first_name": "Albert",
                        "last_name": "Trotter",
                        "person_mail": "uncle.albert@biol.pmf.hr",
                        "person_username": "atrotter",
                        "person_type": "",
                        "username": "uncle_albert@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": "2024-06-10T14:00:13+02:00"
                },
                {
                    "user": {
                        "id": self.user3.id,
                        "person_oib": "33333333333",
                        "first_name": "Ford",
                        "last_name": "Prefect",
                        "person_mail": "ford.prefect@fer.hr",
                        "person_username": "fprefect",
                        "person_type": "",
                        "username": "user45@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user4.id,
                        "person_oib": "44444444444",
                        "first_name": "Zaphod",
                        "last_name": "Beeblebrox",
                        "person_mail": "zb@fer.hr",
                        "person_username": "zbeebleb",
                        "person_type": "",
                        "username": "user70@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user10.id,
                        "person_oib": "",
                        "first_name": "",
                        "last_name": "",
                        "person_mail": "j.jameson@daily-bugle.com",
                        "person_username": "jjjameso",
                        "person_type": "",
                        "username": "j.jameson@daily-bugle.com",
                        "status": False,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project3.id,
                        "identifier": "project-3",
                        "is_active": True,
                        "name": "Project name 3",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "thesis",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "GPU",
                            "CPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user5.id,
                        "person_oib": "",
                        "first_name": "Marvin",
                        "last_name": "The Paranoid Android",
                        "person_mail": "marvin@fer.hr",
                        "person_username": "marvin",
                        "person_type": "",
                        "username": "user42@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project3.id,
                        "identifier": "project-3",
                        "is_active": True,
                        "name": "Project name 3",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "thesis",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "GPU",
                            "CPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user6.id,
                        "person_oib": "",
                        "first_name": "",
                        "last_name": "",
                        "person_mail": "",
                        "person_username": "",
                        "person_type": "",
                        "username": "user348@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project3.id,
                        "identifier": "project-3",
                        "is_active": True,
                        "name": "Project name 3",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "thesis",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "GPU",
                            "CPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user7.id,
                        "person_oib": "77777777777",
                        "first_name": "Derek",
                        "last_name": "Trotter",
                        "person_mail": "delboy@biol.pmf.hr",
                        "person_username": "dtrotter",
                        "person_type": "",
                        "username": "delboy@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project4.id,
                        "identifier": "project-4",
                        "is_active": True,
                        "name": "Project name 4",
                        "institute":
                            "Prirodoslovno-matematički fakultet, Zagreb",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD-CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "expire"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user8.id,
                        "person_oib": "88888888888",
                        "first_name": "Rodney",
                        "last_name": "Trotter",
                        "person_mail": "dave@biol.pmf.hr",
                        "person_username": "rtrotter",
                        "person_type": "",
                        "username": "dave@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project4.id,
                        "identifier": "project-4",
                        "is_active": True,
                        "name": "Project name 4",
                        "institute":
                            "Prirodoslovno-matematički fakultet, Zagreb",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD-CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "expire"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user2.id,
                        "person_oib": "22222222222",
                        "first_name": "Tricia",
                        "last_name": "McMillan",
                        "person_mail": "trillian@fer.hr",
                        "person_username": "tmcmilla",
                        "person_type": "",
                        "username": "user454@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project5.id,
                        "identifier": "project-5",
                        "is_active": True,
                        "name": "Project name 5",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "practical",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project5.id,
                        "identifier": "project-5",
                        "is_active": True,
                        "name": "Project name 5",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "practical",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project6.id,
                        "identifier": "Grant agreement ID: 123456",
                        "is_active": True,
                        "name": "Project name 6",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "practical",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                }
            ]
        )

    def test_get_usersprojects_wrong_token(self):
        request = self.client.get(
            "/api/v1/usersprojects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"},
        )
        self.assertEqual(request.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request.json(),
            {"detail": "Authentication credentials were not provided."}
        )

    def test_get_usersprojects_filter_tags(self):
        request = self.client.get(
            "/api/v1/usersprojects?tags=CLOUD,CLOUD-GPU",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
        )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(
            sorted(request.json(), key=lambda d: d["user"]["id"]), [
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": "2023-05-03T02:00:00+02:00"
                },
                {
                    "user": {
                        "id": self.user2.id,
                        "person_oib": "22222222222",
                        "first_name": "Tricia",
                        "last_name": "McMillan",
                        "person_mail": "trillian@fer.hr",
                        "person_username": "tmcmilla",
                        "person_type": "",
                        "username": "user454@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user7.id,
                        "person_oib": "77777777777",
                        "first_name": "Derek",
                        "last_name": "Trotter",
                        "person_mail": "delboy@biol.pmf.hr",
                        "person_username": "dtrotter",
                        "person_type": "",
                        "username": "delboy@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project4.id,
                        "identifier": "project-4",
                        "is_active": True,
                        "name": "Project name 4",
                        "institute":
                            "Prirodoslovno-matematički fakultet, Zagreb",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD-CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "expire"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user8.id,
                        "person_oib": "88888888888",
                        "first_name": "Rodney",
                        "last_name": "Trotter",
                        "person_mail": "dave@biol.pmf.hr",
                        "person_username": "rtrotter",
                        "person_type": "",
                        "username": "dave@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project4.id,
                        "identifier": "project-4",
                        "is_active": True,
                        "name": "Project name 4",
                        "institute":
                            "Prirodoslovno-matematički fakultet, Zagreb",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD-CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "expire"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user9.id,
                        "person_oib": "99999999999",
                        "first_name": "Albert",
                        "last_name": "Trotter",
                        "person_mail": "uncle.albert@biol.pmf.hr",
                        "person_username": "atrotter",
                        "person_type": "",
                        "username": "uncle_albert@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                }
            ]
        )

    def test_get_usersprojects_filter_projects(self):
        request = self.client.get(
            "/api/v1/usersprojects?projects=project-1,project-2",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
        )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(
            sorted(request.json(), key=lambda d: d["user"]["id"]), [
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": "2023-05-03T02:00:00+02:00"
                },
                {
                    "user": {
                        "id": self.user1.id,
                        "person_oib": "11111111111",
                        "first_name": "Arthur",
                        "last_name": "Dent",
                        "person_mail": "arthur.dent@fer.hr",
                        "person_username": "adent",
                        "person_type": "",
                        "username": "user119@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": "2024-06-10T14:00:13+02:00"
                },
                {
                    "user": {
                        "id": self.user2.id,
                        "person_oib": "22222222222",
                        "first_name": "Tricia",
                        "last_name": "McMillan",
                        "person_mail": "trillian@fer.hr",
                        "person_username": "tmcmilla",
                        "person_type": "",
                        "username": "user454@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user3.id,
                        "person_oib": "33333333333",
                        "first_name": "Ford",
                        "last_name": "Prefect",
                        "person_mail": "ford.prefect@fer.hr",
                        "person_username": "fprefect",
                        "person_type": "",
                        "username": "user45@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user4.id,
                        "person_oib": "44444444444",
                        "first_name": "Zaphod",
                        "last_name": "Beeblebrox",
                        "person_mail": "zb@fer.hr",
                        "person_username": "zbeebleb",
                        "person_type": "",
                        "username": "user70@fer.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project2.id,
                        "identifier": "project-2",
                        "is_active": True,
                        "name": "Project name 2",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-institutional",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CPU",
                            "GPU",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                },
                {
                    "user": {
                        "id": self.user9.id,
                        "person_oib": "99999999999",
                        "first_name": "Albert",
                        "last_name": "Trotter",
                        "person_mail": "uncle.albert@biol.pmf.hr",
                        "person_username": "atrotter",
                        "person_type": "",
                        "username": "uncle_albert@pmf.hr",
                        "status": True,
                        "is_active": True,
                        "is_staff": False,
                        "is_superuser": False
                    },
                    "project": {
                        "id": self.project1.id,
                        "identifier": "project-1",
                        "is_active": True,
                        "name": "Project name 1",
                        "institute": "Fakultet elektrotehnike i računarstva",
                        "project_type": "research-croris",
                        "resources_numbers": None,
                        "staff_resources_type": [
                            "CLOUD-GPU",
                            "CLOUD",
                            "GPU",
                            "CPU",
                            "PADOBRAN",
                            "JUPYTER"
                        ],
                        "state": "approve"
                    },
                    "date_joined": None
                }
            ]
        )


class NewProjectsAPITests(TestCase):
    def setUp(self):
        create_mock_db()

        hrzoo = models.Organization4APIKey.objects.get(name="hrzoo")
        merlin = models.Organization4APIKey.objects.get(name="merlin")
        name, key = models.MyAPIKey.objects.create_key(
            name="test", organization=merlin
        )
        name2, key2 = models.MyAPIKey.objects.create_key(
            name="test2", organization=hrzoo
        )
        self.token = key
        self.token2 = key2

        self.factory = APIRequestFactory()

        self.data = {
            "user": {
                "first_name": "Arthur",
                "last_name": "Dent",
                "person_oib": "11111111111",
                "person_mail": "arthur.dent@fer.hr",
                "username": "user119@fer.hr"
            },
            "project_type": "practical",
            "date_end": "2025-12-31",
            "date_start": "2025-01-01",
            "name": "New project 7",
            "reason":
                "Duis aute irure dolor in reprehenderit in voluptate velit "
                "esse cillum dolore eu fugiat nulla pariatur.",
            "institute": "Institut Ruđer Bošković",
            "science_field": [
                {
                    "name": "PRIRODNE ZNANOSTI",
                    "percent": 100,
                    "scientificfields": [
                        {
                            'name': 'Biologija',
                            "percent": 50
                        },
                        {
                            'name': 'Fizika',
                            "percent": 50
                        }
                    ]
                }
            ],
            "resources_type": ["JUPYTER"]
        }

    def test_post_unauthorized(self):
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            content_type="application/json",
            data=self.data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request.json(),
            {"detail": "Authentication credentials were not provided."}
        )
        self.assertEqual(len(models.Project.objects.all()), 6)

    def test_post_wrong_organization(self):
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token2}"},
            content_type="application/json",
            data=self.data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            request.json(),
            {"detail": "Authentication credentials were not provided."}
        )
        self.assertEqual(len(models.Project.objects.all()), 6)

    @mock.patch("backend.serializers.timezone.now")
    def test_post_project_existing_user(self, mock_now):
        mock_now.side_effect = [
            datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 23, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        ]
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data=self.data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.Project.objects.all()), 7)
        project = models.Project.objects.get(name="New project 7")
        self.assertEqual(project.identifier, "NR-2025-05-001")
        self.assertEqual(project.institute, "Institut Ruđer Bošković")
        self.assertEqual(
            project.reason,
            "Duis aute irure dolor in reprehenderit in voluptate velit "
            "esse cillum dolore eu fugiat nulla pariatur.",
        )
        self.assertEqual(
            project.date_approved, datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            )
        )
        self.assertEqual(project.date_start, datetime.date(2025, 1, 1))
        self.assertEqual(project.date_end, datetime.date(2025, 12, 31))
        self.assertEqual(project.bogus_end, None)
        self.assertEqual(
            project.date_submitted, datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            )
        )
        self.assertEqual(project.date_changed, None)
        self.assertEqual(project.approved_by, None)
        self.assertEqual(project.denied_by, None)
        self.assertEqual(project.changed_by, None)
        self.assertEqual(project.change_history, None)
        self.assertEqual(
            project.science_field, [
                {
                    "name": {
                        "value": "PRIRODNE ZNANOSTI",
                        "label": "PRIRODNE ZNANOSTI"
                    },
                    "percent": 100,
                    "scientificfields": [
                        {
                            'name': {
                                'label': 'Biologija',
                                'value': 'Biologija'
                            },
                            "percent": 50
                        },
                        {
                            'name': {
                                'label': 'Fizika',
                                'value': 'Fizika'
                            },
                            "percent": 50
                        }
                    ]
                }
            ]
        )
        self.assertEqual(project.science_extrasoftware, "")
        self.assertFalse(project.science_extrasoftware_help)
        self.assertEqual(project.resources_numbers, None)
        self.assertTrue(project.is_active)
        self.assertEqual(project.croris_title, "")
        self.assertEqual(project.croris_start, None)
        self.assertEqual(project.croris_end, None)
        self.assertEqual(project.croris_identifier, "")
        self.assertEqual(project.croris_id, None)
        self.assertEqual(project.croris_summary, "")
        self.assertEqual(project.croris_collaborators, None)
        self.assertEqual(project.croris_lead, None)
        self.assertEqual(project.croris_finance, None)
        self.assertEqual(project.croris_institute, None)
        self.assertEqual(project.croris_type, "")
        self.assertEqual(project.staff_resources_type, ["JUPYTER"])
        self.assertEqual(project.state.name, "approve")
        self.assertEqual(len(project.users.all()), 1)
        self.assertEqual(
            [user.username for user in project.users.all()], ["user119@fer.hr"]
        )
        self.assertEqual(project.project_type.name, "practical")
        self.assertEqual(
            len(models.UserProject.objects.filter(
                user=models.User.objects.get(person_username="adent"))
            ), 5
        )
        userproject = models.UserProject.objects.get(
            user=models.User.objects.get(person_username="adent"),
            project=project
        )
        self.assertEqual(userproject.role.name, "lead")
        self.assertEqual(
            userproject.date_joined, datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        )

    @mock.patch("backend.serializers.timezone.now")
    def test_post_project_new_user(self, mock_now):
        mock_now.side_effect = [
            datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 23, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        ]
        data = copy.deepcopy(self.data)
        data["user"] = {
            "first_name": "John J.",
            "last_name": "Rambo",
            "person_oib": "00000000000",
            "person_mail": "jj.rambo@kif.hr",
            "username": "jjrambo@kif.hr"
        }
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data=data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.Project.objects.all()), 7)
        project = models.Project.objects.get(name="New project 7")
        self.assertEqual(project.identifier, "NR-2025-05-001")
        self.assertEqual(project.institute, "Institut Ruđer Bošković")
        self.assertEqual(
            project.reason,
            "Duis aute irure dolor in reprehenderit in voluptate velit "
            "esse cillum dolore eu fugiat nulla pariatur.",
        )
        self.assertEqual(
            project.date_approved, datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            )
        )
        self.assertEqual(project.date_start, datetime.date(2025, 1, 1))
        self.assertEqual(project.date_end, datetime.date(2025, 12, 31))
        self.assertEqual(project.bogus_end, None)
        self.assertEqual(
            project.date_submitted, datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            )
        )
        self.assertEqual(project.date_changed, None)
        self.assertEqual(project.approved_by, None)
        self.assertEqual(project.denied_by, None)
        self.assertEqual(project.changed_by, None)
        self.assertEqual(project.change_history, None)
        self.assertEqual(
            project.science_field, [
                {
                    "name": {
                        "value": "PRIRODNE ZNANOSTI",
                        "label": "PRIRODNE ZNANOSTI"
                    },
                    "percent": 100,
                    "scientificfields": [
                        {
                            'name': {
                                'label': 'Biologija',
                                'value': 'Biologija'
                            },
                            "percent": 50
                        },
                        {
                            'name': {
                                'label': 'Fizika',
                                'value': 'Fizika'
                            },
                            "percent": 50
                        }
                    ]
                }
            ]
        )
        self.assertEqual(project.science_extrasoftware, "")
        self.assertFalse(project.science_extrasoftware_help)
        self.assertEqual(project.resources_numbers, None)
        self.assertTrue(project.is_active)
        self.assertEqual(project.croris_title, "")
        self.assertEqual(project.croris_start, None)
        self.assertEqual(project.croris_end, None)
        self.assertEqual(project.croris_identifier, "")
        self.assertEqual(project.croris_id, None)
        self.assertEqual(project.croris_summary, "")
        self.assertEqual(project.croris_collaborators, None)
        self.assertEqual(project.croris_lead, None)
        self.assertEqual(project.croris_finance, None)
        self.assertEqual(project.croris_institute, None)
        self.assertEqual(project.croris_type, "")
        self.assertEqual(project.staff_resources_type, ["JUPYTER"])
        self.assertEqual(project.state.name, "approve")
        self.assertEqual(len(project.users.all()), 1)
        user = models.User.objects.get(person_oib="00000000000")
        self.assertEqual(
            [user.username for user in project.users.all()], ["jjrambo@kif.hr"]
        )
        self.assertEqual(project.project_type.name, "practical")
        self.assertEqual(len(models.UserProject.objects.filter(user=user)), 1)
        userproject = models.UserProject.objects.get(user=user, project=project)
        self.assertEqual(userproject.role.name, "lead")
        self.assertEqual(
            userproject.date_joined, datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        )

    @mock.patch("backend.serializers.timezone.now")
    def test_post_project_existing_user_wrong_resource(self, mock_now):
        mock_now.side_effect = [
            datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 23, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        ]
        data = copy.deepcopy(self.data)
        data["resources_type"] = ["MEH"]
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data=data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(models.Project.objects.all()), 6)
        self.assertEqual(
            request.data, {
                "status": {
                    "code": status.HTTP_400_BAD_REQUEST,
                    "message":
                        "resources_type: MEH is not among allowed resources"
                }
            }
        )

    @mock.patch("backend.serializers.timezone.now")
    def test_post_project_existing_user_wrong_project_type(self, mock_now):
        mock_now.side_effect = [
            datetime.datetime(
                2025, 5, 7, 11, 53, 20, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 23, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 25, tzinfo=datetime.timezone.utc
            ),
            datetime.datetime(
                2025, 5, 7, 11, 53, 28, tzinfo=datetime.timezone.utc
            )
        ]
        data = copy.deepcopy(self.data)
        data["project_type"] = "meh"
        self.assertEqual(len(models.Project.objects.all()), 6)
        request = self.client.post(
            "/api/v1/projects",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            content_type="application/json",
            data=data,
            format="json"
        )
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(models.Project.objects.all()), 6)
        self.assertEqual(
            request.data, {
                "status": {
                    "code": status.HTTP_400_BAD_REQUEST,
                    "message": "project_type: meh is not valid project type"
                }
            }
        )
