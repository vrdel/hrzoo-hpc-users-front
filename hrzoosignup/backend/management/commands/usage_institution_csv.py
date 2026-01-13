import datetime

import pandas as pd
from backend.utils.accounting import get_active_projects, get_active_users, \
    get_institute_long_name, short2long, get_active_AI_users
from django.core.management.base import BaseCommand
from django.utils import timezone


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

        start_date = timezone.make_aware(
            datetime.datetime(year, 1, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        end_date = timezone.make_aware(
            datetime.datetime(year, 12, 31, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

        projects = get_active_projects(start_date=start_date, end_date=end_date)
        active_users = get_active_users(
            start_date=start_date, end_date=end_date
        )
        active_users_AI = get_active_AI_users(
            start_date=start_date, end_date=end_date
        )

        institutions = [item.institute for item in projects]
        institutions = set(institutions).union(set([
            item.person_institution for item in active_users
        ]))

        institutions = sorted(list(institutions))
        long_names = get_institute_long_name()

        projects_list = list()
        projects_ai_list = list()
        users_list = list()
        users_ai_list = list()
        institutions_long_name = list()
        for institution in institutions:
            institutions_long_name.append(short2long(long_names, institution))
            projects_list.append(len([
                item for item in projects if item.institute == institution
            ]))
            projects_ai_list.append(len([
                item for item in projects if item.institute == institution
                                             and item.uses_ai_tech
            ]))
            users_list.append(len([
                item for item in active_users if
                item.person_institution == institution
            ]))
            users_ai_list.append(len([
                item for item in active_users_AI if
                item.person_institution == institution
            ]))


        data = pd.DataFrame({
            "institution": institutions_long_name,
            "number_of_projects": projects_list,
            "number_of_users": users_list,
            "number_of_ai_projects": projects_ai_list,
            "number_of_ai_users": users_ai_list
        })

        data = data[
            (data["number_of_projects"] > 0) | (data["number_of_users"] > 0)
        ]

        data.to_csv(options["filename"], index=False, sep="*")
