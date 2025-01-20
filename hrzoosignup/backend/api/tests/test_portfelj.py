import datetime
import json
import unittest
from unittest import mock

import requests
from backend.utils.portfelj import Portfelj, PortfeljException

mock_portfelj_data1 = json.dumps(
    {
        "oznaka-usluge": "000-00-000",
        "oznaka-pokazatelja": "P03",
        "semafor": "zeleno",
        "aktualna-vrijednost": 13,
        "datum-mjerenja": format(datetime.date.today(), "%d.%m.%Y."),
        "token": "mock-token"
    }
)

mock_portfelj_data2 = json.dumps(
    {
        "oznaka-usluge": "000-00-000",
        "oznaka-pokazatelja": "P03",
        "semafor": "sivo",
        "aktualna-vrijednost": 13,
        "datum-mjerenja": format(datetime.date.today(), "%d.%m.%Y."),
        "token": "mock-token"
    }
)

header = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json"
}


class MockResponse:
    def __init__(self, status_code):
        self.status_code = status_code

        if status_code == 200:
            self.reason = "OK"

        elif status_code == 401:
            self.reason = "Unauthorized"

        elif status_code == 403:
            self.reason = "Forbidden"

        elif status_code == 404:
            self.reason = "Not Found"

        elif status_code == 422:
            self.reason = "Unprocessable Entity"

    def json(self):
        data = dict()
        if self.status_code == 200:
            data = {
                "success": True,
                "message": "Aktualna vrijednost evidentirana."
            }

        elif self.status_code == 401:
            data = {
                "success": False,
                "message": "Niste autorizirani napraviti taj zahtjev."
            }

        elif self.status_code == 403:
            data = None

        elif self.status_code == 404:
            data = {
                "success": False,
                "message": "Pokazatelj s danom oznakom ne postoji na danoj "
                           "usluzi."
            }

        elif self.status_code == 422:
            data = {
                "success": False,
                "message": {
                    "datum-mjerenja": [
                        "Datum mjerenja mora biti u formatu 'dd.mm.gggg.'."
                    ]
                }
            }

        return data

def mock_response_ok(*args, **kwargs):
    return MockResponse(200)


def mock_response_unauthorized(*args, **kwargs):
    return MockResponse(401)


def mock_response_forbidden(*args, **kwargs):
    return MockResponse(403)


def mock_response_not_found(*args, **kwargs):
    return MockResponse(404)


def mock_response_wrong_date(*args, **kwargs):
    return MockResponse(422)


def mock_exception(*args, **kwargs):
    raise requests.exceptions.RequestException("Something went wrong.")


class PortfeljTests(unittest.TestCase):
    def setUp(self):
        self.portfelj = Portfelj(url="https://mock.url.com", token="mock-token")

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send(self, mock_post):
        mock_post.side_effect = mock_response_ok
        self.portfelj.send(
            usluga="000-00-000",
            pokazatelj="P03",
            vrijednost=13,
            boja="zeleno"
        )
        mock_post.assert_called_with(
            "https://mock.url.com", data=mock_portfelj_data1, headers=header
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_with_default_color(self, mock_post):
        mock_post.side_effect = mock_response_ok
        self.portfelj.send(
            usluga="000-00-000",
            pokazatelj="P03",
            vrijednost=13
        )
        mock_post.assert_called_with(
            "https://mock.url.com", data=mock_portfelj_data2, headers=header
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_unauthorized(self, mock_post):
        mock_post.side_effect = mock_response_unauthorized
        with self.assertRaises(PortfeljException) as context:
            self.portfelj.send(
                usluga="000-00-000",
                pokazatelj="P03",
                vrijednost=13
            )
        self.assertEqual(
            context.exception.__str__(),
            "Portfelj: Error sending data: 000-00-000: P03: 401 "
            "Unauthorized: Niste autorizirani napraviti taj zahtjev."
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_forbidden(self, mock_post):
        mock_post.side_effect = mock_response_forbidden
        with self.assertRaises(PortfeljException) as context:
            self.portfelj.send(
                usluga="000-00-000",
                pokazatelj="P03",
                vrijednost=13
            )
        self.assertEqual(
            context.exception.__str__(),
            "Portfelj: Error sending data: 000-00-000: P03: 403 Forbidden"
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_not_found(self, mock_post):
        mock_post.side_effect = mock_response_not_found
        with self.assertRaises(PortfeljException) as context:
            self.portfelj.send(
                usluga="000-00-000",
                pokazatelj="Ne3",
                vrijednost=13
            )

        self.assertEqual(
            context.exception.__str__(),
            "Portfelj: Error sending data: 000-00-000: Ne3: 404 Not Found: "
            "Pokazatelj s danom oznakom ne postoji na danoj usluzi."
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_wrong_date(self, mock_post):
        mock_post.side_effect = mock_response_wrong_date
        with self.assertRaises(PortfeljException) as context:
            self.portfelj.send(
                usluga="000-00-000",
                pokazatelj="P03",
                vrijednost=13
            )
        self.assertEqual(
            context.exception.__str__(),
            "Portfelj: Error sending data: 000-00-000: P03: 422 "
            "Unprocessable Entity: Datum mjerenja mora biti u formatu "
            "'dd.mm.gggg.'."
        )

    @mock.patch("backend.utils.portfelj.requests.post")
    def test_send_raise_exception(self, mock_post):
        mock_post.side_effect = mock_exception
        with self.assertRaises(PortfeljException) as context:
            self.portfelj.send(
                usluga="000-00-000",
                pokazatelj="P03",
                vrijednost=13
            )
        self.assertEqual(
            context.exception.__str__(),
            "Portfelj: Error sending data: 000-00-000: P03: "
            "Something went wrong."
        )
