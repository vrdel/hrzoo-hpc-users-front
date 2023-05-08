import datetime
from unittest import mock

from backend import models
from backend.api import views
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory
from rest_framework_api_key.models import APIKey


def create_token():
    api_key, key = APIKey.objects.create_key(name="test_key")
    return key


def mock_db():
    models.User.objects.create_user(
        username="hzsi",
        password="xxxxxxx",
        is_superuser=True,
        first_name="SuperUserName",
        last_name="SuperLastName",
        email="super@user.hr",
        is_staff=False,
        is_active=True,
        date_joined=datetime.datetime(2023, 4, 20, 1, 59, 6),
        person_institution="SRCE",
        person_mail="super@user.hr"
    )

    user1 = models.User.objects.create_user(
        username="ford@tnt.com",
        croris_first_name="Alan",
        croris_last_name="Ford",
        croris_mail="alan.ford@tnt.com",
        date_joined=datetime.datetime.now(),
        first_name="Alan",
        last_name="Ford",
        is_active=True,
        is_staff=False,
        is_superuser=False,
        last_login=None,
        person_affiliation="djelatnik",
        person_institution="Grupa TNT",
        person_mail="alan.ford@tnt.com",
        person_oib="xxxxxxxxxxx",
        person_organisation="fgsfds",
        person_uniqueid="ford@tnt.com"
    )

    user2 = models.User.objects.create_user(
        username="br@tnt.com",
        croris_first_name="Bob",
        croris_last_name="Rock",
        croris_mail="bob.rock@tnt.com",
        date_joined=datetime.datetime.now(),
        first_name="Bob",
        last_name="Rock",
        is_active=True,
        is_staff=False,
        is_superuser=False,
        last_login=None,
        person_affiliation="djelatnik",
        person_institution="Grupa TNT",
        person_mail="bob.rock@tnt.com",
        person_oib="xxxxxxxxxxx",
        person_organisation="fgsfds",
        person_uniqueid="bobrock@tnt.com"
    )

    models.User.objects.create_user(
        username="nr1@tnt.com",
        croris_first_name="Number",
        croris_last_name="one",
        croris_mail="number1@tnt.com",
        date_joined=datetime.datetime.now(),
        first_name="Number",
        last_name="One",
        is_active=True,
        is_staff=False,
        is_superuser=False,
        last_login=None,
        person_affiliation="djelatnik",
        person_institution="Grupa TNT",
        person_mail="number1@tnt.com",
        person_oib="xxxxxxxxxxx",
        person_organisation="fgsfds",
        person_uniqueid="number1@tnt.com"
    )

    user4 = models.User.objects.create_user(
        username="oliver@tnt.com",
        croris_first_name="Sir",
        croris_last_name="Oliver",
        croris_mail="oliver@tnt.com",
        date_joined=datetime.datetime.now(),
        first_name="Sir",
        last_name="Oliver",
        is_active=True,
        is_staff=False,
        is_superuser=False,
        last_login=None,
        person_affiliation="djelatnik",
        person_institution="Grupa TNT",
        person_mail="oliver@tnt.com",
        person_oib="xxxxxxxxxxx",
        person_organisation="fgsfds",
        person_uniqueid="oliver@tnt.com"
    )

    models.SSHPublicKey.objects.create(
        name="key1",
        fingerprint="fsdfapfawer",
        public_key="ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx",
        user=user1
    )

    models.SSHPublicKey.objects.create(
        name="key2",
        fingerprint="fsdfaweradf",
        public_key="ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxx",
        user=user1
    )

    models.SSHPublicKey.objects.create(
        name="key3",
        fingerprint="fsdadfwaerbad",
        public_key="ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxxx xxxxx",
        user=user2
    )

    approved = models.State.objects.get(name="approve")
    denied = models.State.objects.get(name="deny")

    research = models.ProjectType.objects.get(name="research-croris")
    thesis = models.ProjectType.objects.get(name="thesis")

    project1 = models.Project.objects.create(
        identifier="HRZOO1",
        name="Project name 1",
        institute="Grupa TNT",
        reason="yes",
        date_start=datetime.datetime(2023, 4, 30, 14, 14, 23),
        date_end=datetime.datetime(2024, 4, 28, 0, 0, 0),
        croris_start=datetime.datetime(2023, 4, 28, 0, 0, 0),
        croris_end=datetime.datetime(2024, 4, 28, 0, 0, 0),
        date_submitted=datetime.datetime.now(),
        date_changed=None,
        approved_by={},
        denied_by=None,
        science_field=[
            {
                "name": {
                    "label": "PRIRODNE ZNANOSTI",
                    "value": "PRIRODNE ZNANOSTI"
                },
                "percent": 100,
                "scientificfields": [
                    {
                        "name": {
                            "label": "Matematika",
                            "value": "Matematika"
                        },
                        "percent": 100
                    }
                ]
            }
        ],
        science_software=[
            "amber/22-cuda"
        ],
        is_active=True,
        staff_resources_type=[{
            "label": "GPU",
            "value": "GPU"
        }],
        science_extrasoftware="",
        science_extrasoftware_help=False,
        state=approved,
        project_type=research
    )

    project2 = models.Project.objects.create(
        identifier="HRZOO2",
        name="Project name 2",
        institute="Grupa TNT",
        reason="yes",
        date_start=datetime.datetime(2023, 1, 1, 0, 0, 0),
        date_end=datetime.datetime(2025, 1, 1, 0, 0, 0),
        croris_start=datetime.datetime(2023, 1, 1, 0, 0, 0),
        croris_end=datetime.datetime(2025, 1, 1, 0, 0, 0),
        date_submitted=datetime.datetime.now(),
        date_changed=None,
        approved_by={},
        denied_by=None,
        science_field=[
            {
                "name": {
                    "label": "PRIRODNE ZNANOSTI",
                    "value": "PRIRODNE ZNANOSTI"
                },
                "percent": 100,
                "scientificfields": [
                    {
                        "name": {
                            "label": "Matematika",
                            "value": "Matematika"
                        },
                        "percent": 100
                    }
                ]
            }
        ],
        science_software=[
            "amber/22-cuda"
        ],
        is_active=True,
        staff_resources_type=[
            {
                "label": "CPU",
                "value": "CPU"
            },
            {
                "label": "BIGMEM",
                "value": "BIGMEM"
            }
        ],
        science_extrasoftware="",
        science_extrasoftware_help=True,
        state=approved,
        project_type=research
    )

    project3 = models.Project.objects.create(
        identifier="HRZOO3",
        name="Project name 3",
        institute="Grupa TNT",
        reason="yes",
        date_start=datetime.datetime(2023, 1, 1, 0, 0, 0),
        date_end=datetime.datetime(2045, 1, 1, 0, 0, 0),
        date_submitted=datetime.datetime.now(),
        date_changed=None,
        approved_by={},
        denied_by=None,
        science_field=[
            {
                "name": {
                    "label": "PRIRODNE ZNANOSTI",
                    "value": "PRIRODNE ZNANOSTI"
                },
                "percent": 100,
                "scientificfields": [
                    {
                        "name": {
                            "label": "Matematika",
                            "value": "Matematika"
                        },
                        "percent": 100
                    }
                ]
            }
        ],
        science_software=[
            "amber/22-cuda"
        ],
        is_active=True,
        science_extrasoftware_help=True,
        state=denied,
        project_type=thesis
    )

    collaborator = models.Role.objects.get(name="collaborator")

    models.UserProject.objects.create(
        user=user1,
        project=project1,
        role=collaborator,
        date_joined=datetime.datetime(2023, 5, 3, 9, 0, 0)
    )

    models.UserProject.objects.create(
        user=user2,
        project=project1,
        role=collaborator,
        date_joined=datetime.datetime(2023, 5, 2, 12, 34, 0)
    )

    models.UserProject.objects.create(
        user=user1,
        project=project2,
        role=collaborator,
        date_joined=datetime.datetime(2023, 5, 1, 14, 0, 0)
    )

    models.UserProject.objects.create(
        user=user4,
        project=project3,
        role=collaborator,
        date_joined=datetime.datetime(2023, 2, 1, 0, 0, 0)
    )


class UsersAPITests(TestCase):
    fixtures = ["states.json", "project-types.json", "roles.json"]

    def setUp(self) -> None:
        self.factory = APIRequestFactory()
        self.view = views.UsersAPI.as_view()
        self.url = "/api/v2/active_users"
        self.token = create_token()

        mock_db()

        self.user1 = models.User.objects.get(username="ford@tnt.com")
        self.user2 = models.User.objects.get(username="br@tnt.com")

        self.project1 = models.Project.objects.get(identifier="HRZOO1")
        self.project2 = models.Project.objects.get(identifier="HRZOO2")

    def test_get_users_wrong_token(self):
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": "Api-Key wrong-token"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_users(self, mock_now):
        mock_now.return_value = datetime.datetime(2023, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.user1.id,
                    "email": "alan.ford@tnt.com",
                    "first_name": "Alan",
                    "last_name": "Ford",
                    "ssh_keys": [
                        {
                            "name": "key1",
                            "public_key": "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx"
                        },
                        {
                            "name": "key2",
                            "public_key":
                                "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxx"
                        }
                    ],
                    "last_project": {
                        "id": self.project1.id,
                        "identifier": "HRZOO1"
                    },
                    "resources": ["BIGMEM", "CPU", "GPU"]
                },
                {
                    "id": self.user2.id,
                    "email": "bob.rock@tnt.com",
                    "first_name": "Bob",
                    "last_name": "Rock",
                    "ssh_keys": [
                        {
                            "name": "key3",
                            "public_key":
                                "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxxx "
                                "xxxxx"
                        }
                    ],
                    "last_project": {
                        "id": self.project1.id,
                        "identifier": "HRZOO1"
                    },
                    "resources": ["GPU"]
                }
            ]
        )

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_users_if_project_expired(self, mock_now):
        mock_now.return_value = datetime.datetime(2024, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.user1.id,
                    "email": "alan.ford@tnt.com",
                    "first_name": "Alan",
                    "last_name": "Ford",
                    "ssh_keys": [
                        {
                            "name": "key1",
                            "public_key": "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx"
                        },
                        {
                            "name": "key2",
                            "public_key":
                                "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxx"
                        }
                    ],
                    "last_project": {
                        "id": self.project2.id,
                        "identifier": "HRZOO2"
                    },
                    "resources": ["BIGMEM", "CPU"]
                }
            ]
        )

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_users_if_project_extended(self, mock_now):
        models.DateExtend.objects.create(
            project=self.project2,
            date=datetime.datetime(2024, 12, 31, 0, 0, 0),
            comment="Extended once"
        )
        mock_now.return_value = datetime.datetime(2025, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.user1.id,
                    "email": "alan.ford@tnt.com",
                    "first_name": "Alan",
                    "last_name": "Ford",
                    "ssh_keys": [
                        {
                            "name": "key1",
                            "public_key": "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx"
                        },
                        {
                            "name": "key2",
                            "public_key":
                                "ssh-rsa xxxxxxxxxxxxxxxxxxxx xxxxxx xxxx"
                        }
                    ],
                    "last_project": {
                        "id": self.project2.id,
                        "identifier": "HRZOO2"
                    },
                    "resources": ["BIGMEM", "CPU"]
                }
            ]
        )


class ProjectsAPITests(TestCase):
    fixtures = ["states.json", "project-types.json", "roles.json"]

    def setUp(self) -> None:
        self.factory = APIRequestFactory()
        self.view = views.ProjectsAPI.as_view()
        self.url = "/api/v2/active_projects"
        self.token = create_token()

        mock_db()

        self.project1 = models.Project.objects.get(identifier="HRZOO1")
        self.project2 = models.Project.objects.get(identifier="HRZOO2")

        self.user1 = models.User.objects.get(username="ford@tnt.com")
        self.user2 = models.User.objects.get(username="br@tnt.com")

    def test_get_projects_if_wrong_token(self):
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": "Api-Key wrong-token"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_projects(self, mock_now):
        mock_now.return_value = datetime.datetime(2023, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.project1.id,
                    "identifier": "HRZOO1",
                    "members": [
                        {
                            "id": self.user1.id,
                            "email": "alan.ford@tnt.com"
                        },
                        {
                            "id": self.user2.id,
                            "email": "bob.rock@tnt.com"
                        }
                    ]
                },
                {
                    "id": self.project2.id,
                    "identifier": "HRZOO2",
                    "members": [
                        {
                            "id": self.user1.id,
                            "email": "alan.ford@tnt.com"
                        }
                    ]
                }
            ]
        )

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_projects_if_expired(self, mock_now):
        mock_now.return_value = datetime.datetime(2024, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.project2.id,
                    "identifier": "HRZOO2",
                    "members": [{
                        "id": self.user1.id,
                        "email": "alan.ford@tnt.com"
                    }]
                }
            ]
        )

    @mock.patch("backend.api.views.get_todays_datetime")
    def test_get_projects_if_extended(self, mock_now):
        models.DateExtend.objects.create(
            project=self.project2,
            date=datetime.datetime(2024, 12, 31, 0, 0, 0),
            comment="Extended once"
        )
        mock_now.return_value = datetime.datetime(2025, 5, 5, 12, 0, 0)
        request = self.factory.get(
            self.url, **{"HTTP_AUTHORIZATION": f"Api-Key {self.token}"}
        )
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "id": self.project2.id,
                    "identifier": "HRZOO2",
                    "members": [{
                        "id": self.user1.id,
                        "email": "alan.ford@tnt.com"
                    }]
                }
            ]
        )
