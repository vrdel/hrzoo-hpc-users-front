import datetime

import pandas as pd
from backend import models
from django.core.management.base import BaseCommand

from .usage_project_csv import get_active_projects


class Command(BaseCommand):
    help = "Export usage data of institutions to .csv file"

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
        projects = get_active_projects(
            start_date=datetime.datetime(year, 1, 1, 0, 0, 0),
            end_date=datetime.datetime(year, 12, 31, 23, 59, 59)
        )

        institutions = sorted([
            item.name_short for item in models.CrorisInstitutions.objects.all()
        ])

        active_users = list()
        for project in projects:
            active_users.extend([item for item in project.users.all()])

        institutions = set(institutions).union(set(
            [item.person_institution for item in active_users]
        ))

        institutions = sorted(list(institutions))

        active_users = list(set(active_users))

        projects_list = list()
        users_list = list()
        for institution in institutions:
            projects_list.append(len([
                item for item in projects if item.institute == institution
            ]))
            users_list.append(len([
                item for item in active_users if
                item.person_institution == institution
            ]))

        data = pd.DataFrame({
            "institution": institutions,
            "number_of_projects": projects_list,
            "number_of_users": users_list
        })

        data = data[
            (data["number_of_projects"] > 0) | (data["number_of_users"] > 0)
        ]

        data.to_csv(options["filename"], index=False, sep="*")
