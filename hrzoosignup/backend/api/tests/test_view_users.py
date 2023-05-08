from backend import models
from backend.api.internal import views
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from .test_views import mock_db


class UsersInfoTests(TestCase):
    fixtures = ["states.json", "project-types.json", "roles.json"]

    def setUp(self) -> None:
        self.factory = APIRequestFactory()
        self.view = views.UsersInfo.as_view()
        self.url = "/api/v2/internal/users"

        mock_db()

        self.user = models.User.objects.get(username="hzsi")
        self.user1 = models.User.objects.get(username="ford@tnt.com")
        self.user2 = models.User.objects.get(username="br@tnt.com")
        self.user3 = models.User.objects.get(username="nr1@tnt.com")
        self.user4 = models.User.objects.get(username="oliver@tnt.com")

    def test_get_users_if_not_authenticated(self):
        request = self.factory.get(self.url)
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_users(self):
        request = self.factory.get(self.url)
        force_authenticate(request, user=self.user)
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data, [
                {
                    "username": "br@tnt.com",
                    "first_name": "Bob",
                    "last_name": "Rock",
                    "person_institution": "Grupa TNT",
                    "person_mail": "bob.rock@tnt.com",
                    "projects": [{
                        "identifier": "HRZOO1",
                        "state": "approve",
                        "role": "collaborator",
                        "type": "research-croris"
                    }],
                    "date_joined": self.user2.date_joined.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }, {
                    "username": "ford@tnt.com",
                    "first_name": "Alan",
                    "last_name": "Ford",
                    "person_institution": "Grupa TNT",
                    "person_mail": "alan.ford@tnt.com",
                    "projects": [{
                        "identifier": "HRZOO1",
                        "state": "approve",
                        "role": "collaborator",
                        "type": "research-croris"
                    }, {
                        "identifier": "HRZOO2",
                        "state": "approve",
                        "role": "collaborator",
                        "type": "research-croris"
                    }],
                    "date_joined": self.user1.date_joined.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }, {
                    "username": "hzsi",
                    "first_name": "SuperUserName",
                    "last_name": "SuperLastName",
                    "person_institution": "SRCE",
                    "person_mail": "super@user.hr",
                    "projects": [],
                    "date_joined": self.user.date_joined.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }, {
                    "username": "nr1@tnt.com",
                    "first_name": "Number",
                    "last_name": "One",
                    "person_institution": "Grupa TNT",
                    "person_mail": "number1@tnt.com",
                    "projects": [],
                    "date_joined": self.user3.date_joined.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }, {
                    "username": "oliver@tnt.com",
                    "first_name": "Sir",
                    "last_name": "Oliver",
                    "person_institution": "Grupa TNT",
                    "person_mail": "oliver@tnt.com",
                    "projects": [{
                        "identifier": "HRZOO3",
                        "state": "deny",
                        "role": "collaborator",
                        "type": "thesis"
                    }],
                    "date_joined": self.user4.date_joined.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }
            ]
        )
