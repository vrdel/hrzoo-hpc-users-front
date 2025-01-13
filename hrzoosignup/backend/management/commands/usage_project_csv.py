import datetime

import pandas as pd
from backend import models
from django.core.management.base import BaseCommand
from django.db.models import Q

from .usage_csv import institutions_realms_dict, get_realm


def get_field(item, field):
    if item["resource_name"] == "jupyter" and field in ["cpuh", "gpuh"]:
        field = f"jupyter_{field[0:3]}_h"

    try:
        return item["accounting_record"][field]

    except KeyError:
        return None


def get_active_projects(start_date, end_date):
    return models.Project.objects.filter(
        (Q(date_end__gte=start_date) | Q(bogus_end__gte=start_date)) &
        Q(date_start__lte=end_date) &
        ~Q(state__name__in=["submit", "deny"])
    )


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
            start_date=datetime.datetime(year, 1, 1, 0, 0, 0),
            end_date=datetime.datetime(year, 12, 31, 23, 59, 59)
        )

        institutions = institutions_realms_dict()

        project_list = list()
        project_type_list = list()
        project_institute = list()
        croris_id = list()
        realm = list()
        users_list = list()
        finance_list = list()
        for project in projects:
            project_list.append(project.name)
            project_type_list.append(project.project_type.name)
            project_institute.append(project.institute)
            users_list.append(len(project.users.all()))
            try:
                finance_list.append(project.croris_finance[0])

            except TypeError:
                finance_list.append("")

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
            "finance": finance_list,
            "croris_id": croris_id,
            "realm": realm
        })

        data.to_csv(options["filename"], index=False, sep="*")
