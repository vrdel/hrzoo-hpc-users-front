import datetime

import pandas as pd
from backend import models
from backend.utils.accounting import institutions_realms_dict, get_realm, \
    get_active_projects, get_institute_long_name, \
    short2long
from django.core.management.base import BaseCommand
from django.utils import timezone


def get_parent_institution(short_name):
    try:
        institute = models.CrorisInstitutions.objects.get(name_short=short_name)
        return institute.parent

    except models.CrorisInstitutions.DoesNotExist:
        return ""


class Command(BaseCommand):
    help = "Export usage parent institutions of projects to .csv file"

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
        long_names = get_institute_long_name()

        parents = list()
        project_names = list()
        project_institutions = list()
        realms = list()
        for project in projects:
            parents.append(get_parent_institution(project.institute))
            project_names.append(project.name)
            project_institutions.append(
                short2long(long_names, project.institute)
            )

            try:
                realms.append(get_realm(institutions, project.institute))

            except KeyError:
                realms.append("")

        data = pd.DataFrame({
            "parent": parents,
            "project": project_names,
            "project_institution": project_institutions,
            "realm": realms
        })

        data.to_csv(options["filename"], index=False, sep="*")
