import datetime
from unittest.mock import patch

from backend import models
from backend.api.internal import views
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from .test_utils import create_mock_db


def extra_usage_for_leader():
    project1 = models.Project.objects.get(identifier="project-1")
    project6 = models.Project.objects.get(name="Project name 6")
    user1 = models.User.objects.get(person_username="adent")
    user2 = models.User.objects.get(person_username="tmcmilla")
    user9 = models.User.objects.get(person_username="atrotter")

    models.ResourceUsage.objects.create(
        user=user2,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1715685120),  # 14 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "7",
            "walltime": 214135,
            "start_time": 1715470985,
            "queue": "queue1",
            "wait_time": 17,
            "qtime": 4321,
            "ngpu": 4,
            "cpuh": 0,
            "gpuh": 128
        }
    )
    models.ResourceUsage.objects.create(
        user=user9,
        project=project1,
        resource_name="padobran",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1720520659),  # 9 Jul 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "12844",
            "walltime": "23",
            "ncpus": "2",
            "start_time": "1720520646",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 74,
            "gpuh": 0
        }
    )
    models.ResourceUsage.objects.create(
        user=user9,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1715938231),  # 17 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "2",
            "walltime": 23423,
            "ncpus": "18",
            "start_time": 1715914808,
            "queue": "queue1",
            "wait_time": 2,
            "qtime": 5,
            "cpuh": 117.115,
            "gpuh": 0
        }
    )
    models.ResourceUsage.objects.create(
        user=user2,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1716368913),  # 22 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "4",
            "walltime": "78",
            "ncpus": "70",
            "start_time": "1716368835",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 1.5167,
            "gpuh": 0
        }
    )
    models.ResourceUsage.objects.create(
        project=project6,
        user=user1,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime(2024, 5, 17, 23, 48, 43),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 17.17,
            "jupyter_gpu_h": 0
        }
    )
    models.ResourceUsage.objects.create(
        project=project6,
        user=user1,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime(2024, 5, 14, 14, 23, 48),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 0.73,
            "jupyter_gpu_h": 7.18
        }
    )
    models.ResourceUsage.objects.create(
        project=project6,
        user=user1,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime(2024, 5, 14, 14, 23, 48),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 13.73,
            "jupyter_gpu_h": 8.23
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project6,
        resource_name="padobran",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1714746334),  # 3 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "cpuh": 6.6667,
            "jobid": "68345",
            "ncpus": "32",
            "qtime": "1714749179",
            "queue": 'cpu',
            "walltime": 750,
            "wait_time": 5,
            "start_time": "1714749181"
        }
    )


class ResourceUsageTests(TestCase):
    def setUp(self):
        create_mock_db()
        self.view = views.ResourceUsage.as_view()
        self.factory = APIRequestFactory()
        self.user = models.User.objects.get(person_username="adent")
        self.today = timezone.make_aware(
            datetime.datetime(2024, 8, 22, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data_per_user(self, mock_date_today):
        mock_date_today.return_value = self.today
        request = self.factory.get("/api/v1/internal/accounting/records")
        force_authenticate(request, user=self.user)
        response = self.view(request)
        self.assertEqual(
            response.data, {
                "supek": {
                    "cumulative": {
                        "cpuh": [
                            {
                                "month": "01/2024",
                                "project-1": 1
                            },
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
                                "project-1": 6,
                                "project-2": 117,
                                "project-4": 1
                            },
                            {
                                "month": "06/2024",
                                "project-1": 7,
                                "project-2": 117,
                                "project-4": 1
                            },
                            {
                                "month": "07/2024",
                                "project-1": 7,
                                "project-2": 117,
                                "project-4": 1
                            },
                            {
                                "month": "08/2024",
                                "project-2": 117,
                                "project-4": 1
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024"
                            },
                            {
                                "month": "06/2024",
                                "project-1": 1
                            },
                            {
                                "month": "07/2024",
                                "project-1": 1
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    },
                    "monthly": {
                        "cpuh": [
                            {
                                "month": "01/2024",
                                "project-1": 1
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024",
                                "project-1": 5,
                                "project-2": 117,
                                "project-4": 1
                            },
                            {
                                "month": "06/2024"
                            },
                            {
                                "month": "07/2024"
                            },
                            {
                                "month": "08/2024"
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024"
                            },
                            {
                                "month": "06/2024",
                                "project-1": 1
                            },
                            {
                                "month": "07/2024"
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    }
                },
                "projects_mapping": {
                    "project-1": "Project name 1",
                    "project-2": "Project name 2",
                    "project-5": "Project name 5",
                    "Grant agreement ID: 123456": "Project name 6"
                }
            }
        )

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data_for_user_without_usage_records(self, mock_date_today):
        mock_date_today.return_value = self.today
        user = models.User.objects.get(person_username="fprefect")
        request = self.factory.get(
            "/api/v1/internal/accounting/records"
        )
        force_authenticate(request, user=user)
        response = self.view(request)
        self.assertEqual(response.data, {})

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data_if_resource_jupyter(self, mock_date_today):
        mock_date_today.return_value = self.today
        user = models.User.objects.get(person_uniqueid="user454@fer.hr")
        request = self.factory.get("/api/v1/internal/accounting/records")
        force_authenticate(request, user=user)
        response = self.view(request)
        self.assertEqual(
            response.data, {
                "jupyter": {
                    "cumulative": {
                        "cpuh": [
                            {
                                "month": "07/2024",
                                "project-5": 5
                            },
                            {
                                "month": "08/2024",
                                "project-5": 5
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "07/2024",
                                "project-5": 3
                            },
                            {
                                "month": "08/2024",
                                "project-5": 3
                            }
                        ]
                    },
                    "monthly": {
                        "cpuh": [
                            {
                                "month": "07/2024",
                                "project-5": 5
                            },
                            {
                                "month": "08/2024"
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "07/2024",
                                "project-5": 3
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    }
                },
                "projects_mapping": {
                    "project-1": "Project name 1",
                    "project-5": "Project name 5"
                }
            }
        )


class ProjectUsagePerUserTests(TestCase):
    def setUp(self):
        create_mock_db()
        extra_usage_for_leader()
        self.view = views.ProjectUsagePerUser.as_view()
        self.factory = APIRequestFactory()
        self.user1 = models.User.objects.get(person_username="adent")
        self.today = timezone.make_aware(
            datetime.datetime(2024, 8, 22, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )

    def test_get_data_if_user_not_lead(self):
        user = models.User.objects.get(person_username="fprefect")
        request = self.factory.get(
            "/api/v1/internal/accounting/project-user-records"
        )
        force_authenticate(request, user=user)
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data, {
                "status": {
                    "code": status.HTTP_401_UNAUTHORIZED,
                    "message": "Only project leaders are allowed this view"
                }
            }
        )

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data(self, mock_date_today):
        mock_date_today.return_value = self.today
        request = self.factory.get(
            "/api/v1/internal/accounting/project-user-records"
        )
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        self.assertEqual(
            response.data, {
                "project-1": {
                    "supek": {
                        "cumulative": {
                            "cpuh": [
                                {
                                    "month": "01/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "02/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "03/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "04/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "05/2024",
                                    "Arthur Dent": 6,
                                    "Tricia McMillan": 1,
                                    "Albert Trotter": 117
                                },
                                {
                                    "month": "06/2024",
                                    "Arthur Dent": 7,
                                    "Tricia McMillan": 1,
                                    "Albert Trotter": 117
                                },
                                {
                                    "month": "07/2024",
                                    "Arthur Dent": 7,
                                    "Tricia McMillan": 1,
                                    "Albert Trotter": 117
                                },
                                {
                                    "month": "08/2024"
                                }
                            ],
                            "gpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024",
                                    "Tricia McMillan": 128
                                },
                                {
                                    "month": "06/2024",
                                    "Arthur Dent": 1,
                                    "Tricia McMillan": 128
                                },
                                {
                                    "month": "07/2024",
                                    "Arthur Dent": 1,
                                    "Tricia McMillan": 128
                                },
                                {
                                    "month": "08/2024"
                                }
                            ]
                        },
                        "monthly": {
                            "cpuh": [
                                {
                                    "month": "01/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024",
                                    "Arthur Dent": 5,
                                    "Tricia McMillan": 1,
                                    "Albert Trotter": 117
                                },
                                {
                                    "month": "06/2024"
                                },
                                {
                                    "month": "07/2024"
                                },
                                {
                                    "month": "08/2024"
                                }
                            ],
                            "gpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024",
                                    "Tricia McMillan": 128
                                },
                                {
                                    "month": "06/2024",
                                    "Arthur Dent": 1
                                },
                                {
                                    "month": "07/2024"
                                },
                                {
                                    "month": "08/2024"
                                }
                            ]
                        }
                    },
                    "padobran": {
                        "cumulative": {
                            "cpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024"
                                },
                                {
                                    "month": "06/2024"
                                },
                                {
                                    "month": "07/2024",
                                    "Albert Trotter": 74
                                },
                                {
                                    "month": "08/2024"
                                }
                            ]
                        },
                        "monthly": {
                            "cpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024"
                                },
                                {
                                    "month": "06/2024"
                                },
                                {
                                    "month": "07/2024",
                                    "Albert Trotter": 74
                                },
                                {
                                    "month": "08/2024"
                                }
                            ]
                        }
                    },
                },
                "Grant agreement ID: 123456": {
                    "padobran": {
                        "cumulative": {
                            "cpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024",
                                    "Arthur Dent": 6
                                },
                                {
                                    "month": "06/2024",
                                    "Arthur Dent": 6
                                },
                                {
                                    "month": "07/2024",
                                    "Arthur Dent": 6
                                },
                                {
                                    "month": "08/2024",
                                    "Arthur Dent": 6
                                }
                            ]
                        },
                        "monthly": {
                            "cpuh": [
                                {
                                    "month": "01/2024"
                                },
                                {
                                    "month": "02/2024"
                                },
                                {
                                    "month": "03/2024"
                                },
                                {
                                    "month": "04/2024"
                                },
                                {
                                    "month": "05/2024",
                                    "Arthur Dent": 6
                                },
                                {
                                    "month": "06/2024"
                                },
                                {
                                    "month": "07/2024"
                                },
                                {
                                    "month": "08/2024"
                                }
                            ]
                        }
                    }
                },
                "projects_mapping": {
                    "project-1": "Project name 1",
                    "Grant agreement ID: 123456": "Project name 6"
                }
            }
        )


class ProjectUsageTests(TestCase):
    def setUp(self):
        create_mock_db()
        extra_usage_for_leader()
        self.view = views.ProjectUsage.as_view()
        self.factory = APIRequestFactory()
        self.user1 = models.User.objects.get(person_username="adent")
        self.today = timezone.make_aware(
            datetime.datetime(2024, 8, 22, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )

    def test_get_data_if_user_not_lead(self):
        user = models.User.objects.get(person_username="fprefect")
        request = self.factory.get(
            "/api/v1/internal/accounting/project-records"
        )
        force_authenticate(request, user=user)
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data, {
                "status": {
                    "code": status.HTTP_401_UNAUTHORIZED,
                    "message": "Only project leaders are allowed this view"
                }
            }
        )

    @patch("backend.api.internal.view_accounting.date_today")
    def test_get_data(self, mock_date_today):
        mock_date_today.return_value = self.today
        request = self.factory.get(
            "/api/v1/internal/accounting/project-records"
        )
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        self.assertEqual(
            response.data, {
                "supek": {
                    "cumulative": {
                        "cpuh": [
                            {
                                "month": "01/2024",
                                "project-1": 1
                            },
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
                                "project-1": 125,
                            },
                            {
                                "month": "06/2024",
                                "project-1": 125
                            },
                            {
                                "month": "07/2024",
                                "project-1": 125
                            },
                            {
                                "month": "08/2024"
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024",
                                "project-1": 128
                            },
                            {
                                "month": "06/2024",
                                "project-1": 129
                            },
                            {
                                "month": "07/2024",
                                "project-1": 129
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    },
                    "monthly": {
                        "cpuh": [
                            {
                                "month": "01/2024",
                                "project-1": 1
                            },
                            {
                                "month": "02/2024",
                            },
                            {
                                "month": "03/2024",
                            },
                            {
                                "month": "04/2024",
                            },
                            {
                                "month": "05/2024",
                                "project-1": 123
                            },
                            {
                                "month": "06/2024"
                            },
                            {
                                "month": "07/2024",
                            },
                            {
                                "month": "08/2024"
                            }
                        ],
                        "gpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024",
                            },
                            {
                                "month": "03/2024",
                            },
                            {
                                "month": "04/2024",
                            },
                            {
                                "month": "05/2024",
                                "project-1": 128,
                            },
                            {
                                "month": "06/2024",
                                "project-1": 1
                            },
                            {
                                "month": "07/2024",
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    }
                },
                "padobran": {
                    "cumulative": {
                        "cpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024",
                                "Grant agreement ID: 123456": 6
                            },
                            {
                                "month": "06/2024",
                                "Grant agreement ID: 123456": 6
                            },
                            {
                                "month": "07/2024",
                                "project-1": 74,
                                "Grant agreement ID: 123456": 6
                            },
                            {
                                "month": "08/2024",
                                "Grant agreement ID: 123456": 6
                            }
                        ]
                    },
                    "monthly": {
                        "cpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024",
                                "Grant agreement ID: 123456": 6
                            },
                            {
                                "month": "06/2024"
                            },
                            {
                                "month": "07/2024",
                                "project-1": 74
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    }
                },
                "cloud": {
                    "cumulative": {
                        "cpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024"
                            },
                            {
                                "month": "06/2024",
                                "project-1": 1025
                            },
                            {
                                "month": "07/2024",
                                "project-1": 1025
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    },
                    "monthly": {
                        "cpuh": [
                            {
                                "month": "01/2024"
                            },
                            {
                                "month": "02/2024"
                            },
                            {
                                "month": "03/2024"
                            },
                            {
                                "month": "04/2024"
                            },
                            {
                                "month": "05/2024"
                            },
                            {
                                "month": "06/2024",
                                "project-1": 1025
                            },
                            {
                                "month": "07/2024"
                            },
                            {
                                "month": "08/2024"
                            }
                        ]
                    }
                },
                "projects_mapping": {
                    "project-1": "Project name 1",
                    "Grant agreement ID: 123456": "Project name 6"
                }
            }
        )
