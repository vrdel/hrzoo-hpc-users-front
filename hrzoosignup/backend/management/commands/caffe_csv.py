import calendar
import datetime

import pandas as pd
from backend.utils.accounting import get_active_projects, \
    get_institute_long_name, short2long, get_usage
from django.core.management.base import BaseCommand
from django.utils import timezone


def get_field(item, field):
    try:
        return item.accounting_record[field]

    except KeyError:
        return None


class Command(BaseCommand):
    help = "Export monthly usage data for Advanced Computing Caffe"

    def add_arguments(self, parser):
        parser.add_argument(
            "-m", "--month", type=int, dest="month", help="month"
        )
        parser.add_argument(
            "-y", "--year", type=int, dest="year", help="year"
        )
        parser.add_argument(
            "-f", "--filename", type=str, dest="filename", help="file name"
        )

    def handle(self, *args, **options):
        month = options["month"]
        year = options["year"]
        last_day = calendar.monthrange(year, month)[1]
        start_date = timezone.make_aware(
            datetime.datetime(year, month, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        end_date = timezone.make_aware(
            datetime.datetime(year, month, last_day, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

        projects = get_active_projects(start_date=start_date, end_date=end_date)
        usage = get_usage(
            start_date=start_date,
            end_date=end_date,
            resources=["supek", "padobran"]
        )
        institution_long_names = get_institute_long_name()

        data = pd.DataFrame({
            "short_name": list(set([item.institute for item in projects]))
        })

        data["institute"] = data.apply(
            lambda row: short2long(institution_long_names, row["short_name"]),
            axis=1
        )

        data["supek_cpuh"] = data.apply(
            lambda row: sum([
                get_field(item, "cpuh") for item in usage
                if (
                    item.project.institute == row["short_name"] and
                    item.resource_name == "supek"
                )
            ]),
            axis=1
        )

        data["supek_gpuh"] = data.apply(
            lambda row: sum([
                get_field(item, "gpuh") for item in usage
                if (
                    item.project.institute == row["short_name"] and
                    item.resource_name == "supek"
                )
            ]),
            axis=1
        )

        data["padobran"] = data.apply(
            lambda row: sum([
                get_field(item, "cpuh") for item in usage
                if (
                        item.project.institute == row["short_name"] and
                        item.resource_name == "padobran"
                )
            ]), axis=1
        )

        data["n_supek_cpuh"] = data.apply(
            lambda row: len([
                get_field(item, "cpuh") for item in usage
                if (
                        item.project.institute == row["short_name"] and
                        item.resource_name == "supek"
                )
            ]),
            axis=1
        )

        data["n_supek_gpuh"] = data.apply(
            lambda row: len([
                get_field(item, "gpuh") for item in usage
                if (
                        item.project.institute == row["short_name"] and
                        item.resource_name == "supek"
                )
            ]),
            axis=1
        )

        data["n_padobran"] = data.apply(
            lambda row: len([
                get_field(item, "cpuh") for item in usage
                if (
                        item.project.institute == row["short_name"] and
                        item.resource_name == "padobran"
                )
            ]), axis=1
        )

        data.drop(["short_name"], axis="columns", inplace=True)

        data.to_csv(options["filename"], index=False, sep="*")
