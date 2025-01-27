import datetime

import pandas as pd
from backend.utils.accounting import get_field, institutions_realms_dict, \
    get_wait_time, get_realm, job_tag, get_instance_id, get_usage, \
    get_institute_long_name, short2long
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Export usage data to .csv file"

    def add_arguments(self, parser):
        parser.add_argument(
            "-f", "--file", type=str, dest="filename", required=True,
            help="full path to the .csv file"
        )
        parser.add_argument(
            "-y", "--year", type=int, dest="year",
            help="year for which you want information generated"
        )

    def handle(self, *args, **options):
        year = options["year"]

        start_date= timezone.make_aware(
            datetime.datetime(year, 1, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        end_date = timezone.make_aware(
            datetime.datetime(year, 12, 31, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

        usage = get_usage(start_date=start_date, end_date=end_date)

        institutions = institutions_realms_dict()
        long_names = get_institute_long_name()

        data = pd.DataFrame.from_records(
            usage.values(
                "project__name",
                "project__institute",
                "project__project_type__name",
                "resource_name",
                "accounting_record"
            )
        )

        data["cpuh"] = data.apply(lambda row: get_field(row, "cpuh"), axis=1)
        data["gpuh"] = data.apply(lambda row: get_field(row, "gpuh"), axis=1)
        data["walltime"] = data.apply(
            lambda row: get_field(row, "walltime"), axis=1
        )
        data["wait_time"] = data.apply(lambda row: get_wait_time(row), axis=1)
        data["realm"] = data.apply(
            lambda row: get_realm(institutions, row["project__institute"]),
            axis=1
        )
        data["tag"] = data.apply(lambda row: job_tag(row), axis=1)
        data["VM"] = data.apply(lambda row: get_instance_id(row), axis=1)
        data["project__institute"] = data.apply(
            lambda row: short2long(long_names, row.project__institute), axis=1
        )

        data.drop([
            "accounting_record"
        ], axis="columns", inplace=True)

        data = data.rename(columns={
            "project__name": "project",
            "project__institute": "institution",
            "project__project_type__name": "type"
        })

        data.to_csv(options["filename"], index=False, sep="*")
