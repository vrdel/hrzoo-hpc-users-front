import csv
import datetime

from backend.serializers_internal import ResourceUsageSerializer
from backend.utils.accounting import get_usage
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

        start_date = timezone.make_aware(
            datetime.datetime(year, 1, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        end_date = timezone.make_aware(
            datetime.datetime(year, 12, 31, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

        with open(options["filename"], "w", newline="") as csvfile:
            usage = get_usage(
                start_date=start_date, end_date=end_date
            ).iterator()
            writer = None

            for obj in usage:
                row = ResourceUsageSerializer(obj).data
                if writer is None:
                    writer = csv.DictWriter(
                        csvfile, fieldnames=row.keys(), delimiter="*"
                    )
                    writer.writeheader()

                writer.writerow(row)
