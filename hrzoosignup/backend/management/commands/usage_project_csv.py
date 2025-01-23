import datetime

import pandas as pd
from backend.utils.accounting import institutions_realms_dict, get_realm, \
    get_active_projects, get_users_in_project
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Export usage data of projects to .csv file"

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
            start_date=timezone.make_aware(
                datetime.datetime(year, 1, 1, 0, 0, 0),
                timezone=timezone.get_current_timezone()
            ),
            end_date=timezone.make_aware(
                datetime.datetime(year, 12, 31, 23, 59, 59),
                timezone=timezone.get_current_timezone()
            )
        )

        institutions = institutions_realms_dict()

        project_list = list()
        project_type_list = list()
        project_institute = list()
        croris_id = list()
        realm = list()
        users_list = list()
        for project in projects:
            project_list.append(project.name)
            project_type_list.append(project.project_type.name)
            project_institute.append(project.institute)
            users_list.append(len(get_users_in_project(project.identifier)))

            try:
                croris_id.append(project.croris_id)

            except TypeError:
                croris_id.append("")

            try:
                realm.append(get_realm(institutions, project.institute))

            except KeyError:
                realm.append("")

        data = pd.DataFrame({
            "project": project_list,
            "project_type": project_type_list,
            "number_of_users": users_list,
            "project_institution": project_institute,
            "croris_id": croris_id,
            "realm": realm
        })

        data.to_csv(options["filename"], index=False, sep="*")
