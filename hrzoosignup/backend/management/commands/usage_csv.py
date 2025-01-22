import datetime

import pandas as pd
from backend import models
from django.conf import settings
from backend.utils.accounting import get_field, institutions_realms_dict, \
    get_wait_time, get_realm, job_tag, get_instance_id
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone


def get_usage(start_date, end_date):
    return models.ResourceUsage.objects.filter(
        Q(end_time__gte=start_date) &
        Q(end_time__lte=end_date) &
        ~Q(resource_name="jupyter") & (
                Q(project__date_end__gte=start_date.date()) |
                Q(project__bogus_end__gte=start_date.date())
        ) & ~Q(
            project__state__name__in=["submit", "deny"]
        ) & ~Q(user__person_institution__in=["", "Nepoznato"])
    )


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

        data.drop([
            "accounting_record"
        ], axis="columns", inplace=True)

        data = data.rename(columns={
            "project__name": "project",
            "project__institute": "institution",
            "project__project_type__name": "type"
        })

        data.to_csv(options["filename"], index=False, sep="*")
