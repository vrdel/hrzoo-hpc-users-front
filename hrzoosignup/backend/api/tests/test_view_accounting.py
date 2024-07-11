from backend import models
from django.test import TestCase
from rest_framework import status
from rest_framework_api_key.models import APIKey


class ResourceUsageAPITests(TestCase):
    def setUp(self):
        name, key = APIKey.objects.create_key(name="test")
        self.token = key
        state1 = models.State.objects.create(
            name="approve"
        )
        models.State.objects.create(
            name="submit"
        )
        models.State.objects.create(
            name="deny"
        )
        models.State.objects.create(
            name="extend"
        )
        models.State.objects.create(
            name="expire"
        )
        self.project1 = models.Project.objects.create(
            identifier="project-1",
            name="Project name 1",
            institute="Sektor za gubljenje vremena",
            science_extrasoftware_help=False,
            is_active=True,
            state=state1
        )
        self.project2 = models.Project.objects.create(
            identifier="project-3",
            name="Project name 3",
            institute="Sektor za gubljenje vremena",
            science_extrasoftware_help=False,
            is_active=True,
            state=state1
        )
        self.user1 = models.User.objects.create_user(
            username="user1",
            person_username="user1",
            status=True,
            mailinglist_subscribe=True
        )
        self.user2 = models.User.objects.create_user(
            username="user2",
            person_username="user2",
            status=True,
            mailinglist_subscribe=True
        )

    def test_post_data(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 0)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            data={
                "usage": [
                    {
                        "user": "user1",
                        "jobs": [
                            {
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
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 2)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "end_time": "1717849428",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2"
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "start_time": "1716001512",
            "end_time": "1716001522",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": ""
        })

    def test_post_data_multiple_users(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 0)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            data={
                "usage": [
                    {
                        "user": "user1",
                        "jobs": [
                            {
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
                    {
                        "user": "user2",
                        "jobs": [
                            {
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
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(models.ResourceUsage.objects.all()), 3)
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
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "end_time": "1717849428",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2"
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "start_time": "1716001512",
            "end_time": "1716001522",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": ""
        })
        self.assertEqual(usage3.user, self.user2)
        self.assertEqual(usage3.project, self.project2)
        self.assertEqual(usage3.accounting_record, {
            "jobid": "12843",
            "walltime": "13",
            "ncpus": "2",
            "start_time": "1720520646",
            "end_time": "1720520659",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8"
        })

    def test_post_data_nonexisting_user(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 0)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            data={
                "usage": [
                    {
                        "user": "user1",
                        "jobs": [
                            {
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
                    {
                        "user": "user3",
                        "jobs": [
                            {
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
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"], "User user3 not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 2)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12345"
        )[0]
        usage2 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12345",
            "walltime": "3920",
            "ncpus": "4",
            "start_time": "1717845508",
            "end_time": "1717849428",
            "queue": "gpu",
            "wait_time": "2",
            "qtime": "1717796832",
            "ngpus": "2"
        })
        self.assertEqual(usage2.user, self.user1)
        self.assertEqual(usage2.project, self.project1)
        self.assertEqual(usage2.resource_name, "supek")
        self.assertEqual(usage2.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "start_time": "1716001512",
            "end_time": "1716001522",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": ""
        })

    def test_post_data_multiple_nonexisting_user(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 0)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            data={
                "usage": [
                    {
                        "user": "user3",
                        "jobs": [
                            {
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
                            }
                        ]
                    },
                    {
                        "user": "user1",
                        "jobs": [
                            {
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
                    {
                        "user": "user4",
                        "jobs": [
                            {
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
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"],
            "Users user3, user4 not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 1)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "start_time": "1716001512",
            "end_time": "1716001522",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": ""
        })

    def test_post_data_nonexisting_project(self):
        self.assertEqual(len(models.ResourceUsage.objects.all()), 0)
        request = self.client.post(
            "/api/v1/accounting/records?resource=supek",
            **{'HTTP_AUTHORIZATION': f"Api-Key {self.token}"},
            data={
                "usage": [
                    {
                        "user": "user1",
                        "jobs": [
                            {
                                "jobid": "12345",
                                "walltime": "3920",
                                "ncpus": "4",
                                "project": "project-5",
                                "start_time": "1717845508",
                                "end_time": "1717849428",
                                "queue": "gpu",
                                "wait_time": "2",
                                "qtime": "1717796832",
                                "ngpus": "2"
                            },
                            {
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
                ]
            }
        )
        self.assertEqual(request.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            request.data["status"]["message"], "Project project-5 not found"
        )
        self.assertEqual(len(models.ResourceUsage.objects.all()), 1)
        usage1 = models.ResourceUsage.objects.filter(
            accounting_record__jobid="12346"
        )[0]
        self.assertEqual(usage1.user, self.user1)
        self.assertEqual(usage1.project, self.project1)
        self.assertEqual(usage1.resource_name, "supek")
        self.assertEqual(usage1.accounting_record, {
            "jobid": "12346",
            "walltime": "10",
            "ncpus": "18",
            "start_time": "1716001512",
            "end_time": "1716001522",
            "queue": "queue1",
            "wait_time": "2",
            "qtime": ""
        })
