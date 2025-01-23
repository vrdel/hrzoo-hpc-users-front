import datetime

from backend.utils.accounting import get_usage, get_active_projects
from backend.utils.portfelj import Portfelj, PortfeljException
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone


def get_field(item, field):
    try:
        return item.accounting_record[field]

    except KeyError:
        return None


class Command(BaseCommand):
    help = "Send data to Portfelj poslovnih aktivnosti"

    def add_arguments(self, parser):
        parser.add_argument("--year", type=int, dest="year", help="year")

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

        projects = get_active_projects(
            start_date=start_date,
            end_date=end_date
        )

        users = list()
        for project in projects:
            users.extend(project.users.all())

        users = set(users)

        project_institutes = set([item.institute for item in projects])
        user_institutions = set([item.person_institution for item in users])

        institutions = project_institutes.union(user_institutions)

        usage = get_usage(start_date=start_date, end_date=end_date)

        cpuh = [
            get_field(item, "cpuh") for item in usage
            if item.resource_name in ["supek", "padobran"]
        ]
        gpuh = [
            get_field(item, "gpuh") for item in usage
            if item.resource_name == "supek"
        ]

        total_cpuh = sum([item for item in cpuh if item])
        total_gpuh = sum([item for item in gpuh if item])

        padobran_jobs = set([
            get_field(item, "jobid") for item in usage if
            item.resource_name == "padobran"
        ])
        supek_jobs = set([
            get_field(item, "jobid") for item in usage
            if item.resource_name == "supek"
        ])

        n_jobs = len(supek_jobs) + len(padobran_jobs)

        vcpuh = [
            get_field(item, "cpuh") for item in usage
            if item.resource_name == "cloud"
        ]

        vgpuh = [
            get_field(item, "gpuh") for item in usage
            if item.resource_name == "cloud"
        ]

        total_vcpuh = sum([item for item in vcpuh if item])
        total_vgpuh = sum([item for item in vgpuh if item])

        vms = set([
            get_field(item, "instance_id") for item in usage
            if item.resource_name == "cloud"
        ])

        portfelj = Portfelj(
            url=settings.PORTFELJ_URL,
            token=settings.PORTFELJ_TOKEN
        )

        data2send = {
            "P01": len(projects),
            "P02": len(users),
            "P03": len(institutions),
            "P15": round(total_cpuh, 4),
            "P16": round(total_gpuh, 4),
            "P17": n_jobs,
            "P18": round(total_vcpuh, 4),
            "P19": round(total_vgpuh, 4),
            "P20": len(vms)
        }

        for indicator, value in data2send.items():
            try:
                portfelj.send(
                    usluga="004-01-000",
                    pokazatelj=indicator,
                    vrijednost=value
                )

            except PortfeljException as e:
                self.stdout.write(
                    f"Error sending indicator {indicator}: {str(e)}"
                )
                continue
