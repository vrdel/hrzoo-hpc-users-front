import datetime

import pandas as pd
from backend.utils.accounting import get_active_projects, \
    institutions_realms_dict, get_realm
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Export project financing to .csv file"

    def add_arguments(self, parser):
        parser.add_argument(
            "-f", "--file", type=str, dest="filename",
            help="full path to the .csv file"
        )
        parser.add_argument(
            "-y", "--year", type=int, dest="year",
            help="year for which you want information generated"
        )

    def handle(self, *args, **options):
        year = options["year"]

        croris_projects = [
            project for project in get_active_projects(
                start_date=datetime.datetime(year, 1, 1, 0, 0, 0),
                end_date=datetime.datetime(year, 12, 31, 23, 59, 59)
            ) if project.project_type.name == "research-croris"
        ]

        institutions = institutions_realms_dict()

        sources = list()
        projects = list()
        percentages = list()
        amounts = list()
        currencies = list()
        realms = list()
        for project in croris_projects:
            try:
                total_amount = sum(
                    [item["amount"] for item in project.croris_finance]
                )
            except TypeError:
                self.stderr.write(
                    f"Wrong finance entry for project {project.identifier}"
                )
                continue

            else:
                for finance in project.croris_finance:
                    sources.append(finance["name"])
                    if total_amount == 0:
                        percentages.append(0)
                    else:
                        percentages.append(
                            finance["amount"] / total_amount * 100
                        )

                    amounts.append(finance["amount"])
                    currencies.append(finance["currency"])
                    projects.append(project.name)
                    realms.append(get_realm(institutions, project.institute))

        data = pd.DataFrame({
            "source": sources,
            "project": projects,
            "percentage": percentages,
            "amount": amounts,
            "currency": currencies,
            "realm": realms
        })

        data.to_csv(options["filename"], index=False, sep="*")
