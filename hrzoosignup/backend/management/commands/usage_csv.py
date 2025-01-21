import datetime

import pandas as pd
from backend import models
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone


def get_field(item, field):
    try:
        return item["accounting_record"][field]

    except KeyError:
        return None


def get_wait_time(item):
    try:
        return get_field(item, "wait_time")

    except TypeError:
        return None


def job_tag(item):
    if item.resource_name in ["supek", "padobran"]:
        if "gpu" in item["accounting_record"]["queue"]:
            return "GPU"

        else:
            return "CPU"

    else:
        return None


def _get_realm_from_mapping(institution):
    mapping = [
        item["to"] for item in settings.MAP_REALMS if
        item["from"] == institution
    ]
    if len(mapping) > 0:
        return mapping[0]

    else:
        return ""


def institutions_realms_dict():
    institutions = dict()
    for item in models.CrorisInstitutions.objects.all():
        institutions.update({item.name_long: item.realm})
        if item.name_short != item.name_long:
            institutions.update({item.name_short: item.realm})

    return institutions


def get_realm(institutions, institution):
    try:
        realm = institutions[institution]

        if not realm:
            realm = _get_realm_from_mapping(institution)

    except KeyError:
        try:
            realm = _get_realm_from_mapping(institution)

        except KeyError:
            return ""

    return realm


def get_finance(item):
    try:
        return item["project__croris_finance"][0]

    except TypeError:
        return ""


def get_instance_id(item):
    try:
        return get_field(item, "instance_id")

    except KeyError:
        return ""


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

        start_datetime = timezone.make_aware(
            datetime.datetime(year, 1, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        start_date =  datetime.date(year, 1, 1)
        end_date = timezone.make_aware(
            datetime.datetime(year, 12, 31, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

        usage = models.ResourceUsage.objects.filter(
            Q(end_time__gte=start_datetime) &
            Q(end_time__lte=end_date) &
            ~Q(resource_name="jupyter") & (
                Q(project__date_end__gte=start_date) |
                Q(project__bogus_end__gte=start_date)
            ) & ~Q(
                project__state__name__in=["submit", "deny"]
            )
        )

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
