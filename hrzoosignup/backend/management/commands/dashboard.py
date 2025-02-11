import base64
import calendar
import logging
import sys

import requests
from backend.dashboard.indicators import DashboardIndicators
from django.conf import settings
from django.core.management.base import BaseCommand

LOGGER = logging.getLogger("hrzoosignup.crons")

UNIVERSITIES = {
    "263": "Sveučilište u Zagrebu",
    "264": "Sveučilište u Splitu",
    "265": "Sveučilište u Rijeci",
    "266": "Sveučilište Josipa Jurja Strossmayera u Osijeku"
}


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
        month = options["month"]
        year = options["year"]

        LOGGER.info(f"Sending data to Dashboard for {month}/{year}")

        indicators = DashboardIndicators(
            month=options["month"], year=options["year"]
        )

        token = base64.b64encode(
            f"{settings.DASHBOARD_USERNAME}:{settings.DASHBOARD_PASS}".encode(
                "ascii"
            )
        )
        headers = {"Authorization": f"Basic {token.decode('ascii')}"}

        day = calendar.monthrange(
            options["year"], options["month"]
        )[1]
        date = (
            f"{options['year']}-{options['month']:02d}-"
            f"{day}"
        )

        try:
            response = requests.get(
                settings.DASHBOARD_API_INSTITUTIONS, headers=headers
            )

        except requests.exceptions.RequestException as e:
            LOGGER.error(f"Error fetching  institutions: {str(e)}")
            sys.exit(2)

        else:
            if not response.ok:
                LOGGER.error(
                    f"Error fetching institutions: "
                    f"{response.status_code} {response.reason}"
                )
                sys.exit(2)

            else:
                institutions = indicators.institutions()
                dashboard_institutions = response.json()

                really_using = list()
                for institution, conf in institutions.items():
                    ustanova_id = None
                    if not (conf["oib"] or conf["mbu"]):
                        LOGGER.warning(
                            f"Missing OIB and MBU for institution {institution}"
                        )
                        continue

                    else:
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
                                LOGGER.warning(
                                    f"Missing institution: {institution}"
                                )

                        if ustanova_id:
                            really_using.append(ustanova_id)

                            data2send = {
                                "7": indicators.users(institution=institution),
                                "8": indicators.projects(
                                    institution=institution
                                ),
                                "36": indicators.supek_cpu(
                                    institution=institution
                                ),
                                "37": indicators.vrancic_cpu(
                                    institution=institution
                                ),
                                "83": indicators.padobran(
                                    institution=institution
                                ),
                                "84": indicators.jupyter_cpu(
                                    institution=institution
                                ),
                                "85": indicators.supek_gpu(
                                    institution=institution
                                ),
                                "86": indicators.vrancic_gpu(
                                    institution=institution
                                ),
                                "87": indicators.jupyter_gpu(
                                    institution=institution
                                )
                            }

                            for indicator, value in data2send.items():
                                response = requests.post(
                                    settings.DASHBOARD_API_INDICATORS,
                                    json={
                                        "ustanovaId": ustanova_id,
                                        "pokazateljId": int(indicator),
                                        "vrijednost": value,
                                        "datum": date
                                    },
                                    headers=headers
                                )

                                if not response.ok:
                                    LOGGER.error(
                                        f"Error sending indicator {indicator} "
                                        f"for institution {institution}: "
                                        f"{response.status_code} "
                                        f"{response.reason}"
                                    )
                                    continue

                try:
                    response = requests.get(
                        settings.DASHBOARD_API_PERMISSIONS_LIST, headers=headers
                    )
                    response.raise_for_status()

                except requests.exceptions.RequestException as e:
                    LOGGER.error(
                        f"Error fetching Dashboard permissions list: {str(e)}"
                    )
                    sys.exit(2)

                else:
                    existing_really_using = response.json()

                    dashboard_really_using = [
                        item["ustanovaId"] for item in existing_really_using if
                        item["stvarnoKoristi"] == "DA"
                    ]

                    for item in really_using:
                        if item not in dashboard_really_using:
                            response = requests.post(
                                settings.DASHBOARD_API_PERMISSIONS,
                                json={
                                    "uslugaId": 1,
                                    "ustanovaId": item,
                                    "stvarnoKoristi": "DA"
                                },
                                headers=headers
                            )

                            if not response.ok:
                                LOGGER.error(
                                    f"Error updating permissions for "
                                    f"institution {item}: "
                                    f"{response.status_code} {response.reason}"
                                )

                LOGGER.info("Sending aggregated data to four Universities...")

                for uniid, university in UNIVERSITIES.items():
                    aggr_data2send = {
                        "98": indicators.aggregated_users(
                            university=university
                        ),
                        "99": indicators.aggregated_projects(
                            university=university
                        ),
                        "100": indicators.aggregated_supek_cpu(
                            university=university
                        ),
                        "101": indicators.aggregated_vrancic_cpu(
                            university=university
                        ),
                        "102": indicators.aggregated_padobran(
                            university=university
                        ),
                        "103": indicators.aggregated_jupyter_cpu(
                            university=university
                        ),
                        "104": indicators.aggregated_supek_gpu(
                            university=university
                        ),
                        "106": indicators.aggregated_vrancic_gpu(
                            university=university
                        ),
                        "107": indicators.aggregated_jupyter_gpu(
                            university=university
                        )
                    }

                    for indicator_id, value in aggr_data2send.items():
                        response = requests.post(
                            settings.DASHBOARD_API_INDICATORS,
                            json={
                                "ustanovaId": int(uniid),
                                "pokazateljId": int(indicator_id),
                                "vrijednost": value,
                                "datum": date
                            },
                            headers=headers
                        )

                        if not response.ok:
                            LOGGER.error(
                                f"Error sending indicator {indicator_id} "
                                f"for University {university}: "
                                f"{response.status_code} "
                                f"{response.reason}"
                            )
                            continue

                        else:
                            LOGGER.info(
                                f"Indicators for University {university} sent "
                                f"successfully"
                            )

        LOGGER.info("All data sent to dashboard successfully")
