import base64
import calendar

import requests
from backend.dashboard.indicators import DashboardIndicators
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Send indicators to dashboard"

    def add_arguments(self, parser):
        parser.add_argument(
            "--month", type=int, dest="month", help="month"
        )
        parser.add_argument(
            "--year", type=int, dest="year", help="year"
        )

    def handle(self, *args, **options):
        indicators = DashboardIndicators(
            month=options["month"], year=options["year"]
        )

        token = base64.b64encode(
            f"{settings.DASHBOARD_USERNAME}:{settings.DASHBOARD_PASS}".encode(
                "ascii"
            )
        )

        response = requests.get(
            settings.DASHBOARD_API_INSTITUTIONS,
            headers={"Authorization": f"Basic {token.decode('ascii')}"}
        )

        institutions = indicators.institutions()
        dashboard_institutions = response.json()

        for institution, conf in institutions.items():
            ustanova_id = None
            try:
                ustanova_id = [
                    item for item in dashboard_institutions if
                    item["oib"] == conf["oib"]
                ][0]["ustanovaId"]

            except IndexError:
                try:
                    ustanova_id = [
                        item for item in dashboard_institutions if
                        item["mbu"] == conf["mbu"]
                    ][0]["ustanovaId"]

                except IndexError:
                    self.stderr.write(f"ERROR: {institution}")

            if ustanova_id:
                day = calendar.monthrange(options["year"], options["month"])[1]
                date = f"{options['year']}-{options['month']:02d}-{day}"
                response1 = requests.post(
                    settings.DASHBOARD_API_INDICATORS,
                    json={
                        "ustanovaId": ustanova_id,
                        "pokazateljId": 7,
                        "vrijednost": indicators.users(institution=institution),
                        "datum": date
                    },
                    headers={"Authorization": f"Basic {token.decode('ascii')}"}
                )

                if not response1.ok:
                    self.stderr.write(
                        f"Error sending indicator 7: "
                        f"{response1.status_code} {response1.reason}"
                    )
                    continue

                response2 = requests.post(
                    settings.DASHBOARD_API_INDICATORS,
                    json={
                        "ustanovaId": ustanova_id,
                        "pokazateljId": 8,
                        "vrijednost": indicators.projects(
                            institution=institution
                        ),
                        "datum": date
                    },
                    headers={"Authorization": f"Basic {token.decode('ascii')}"}
                )

                if not response2.ok:
                    self.stderr.write(
                        f"Error sending indicator 8: "
                        f"{response2.status_code} {response2.reason}"
                    )
