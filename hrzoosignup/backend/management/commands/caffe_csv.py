import pandas as pd
from backend.dashboard.indicators import CaffeIndicators
from backend.utils.accounting import get_institute_long_name, short2long
from django.core.management.base import BaseCommand


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
        indicators = CaffeIndicators(
            month=options["month"], year=options["year"]
        )

        institution_long_names = get_institute_long_name()

        data = pd.DataFrame({"short_name": indicators.institutions()})

        data["institute"] = data.apply(
            lambda row: short2long(institution_long_names, row["short_name"]),
            axis=1
        )

        data["supek_cpuh"] = data.apply(
            lambda row: indicators.supek_cpuh(institution=row.short_name),
            axis=1
        )

        data["supek_gpuh"] = data.apply(
            lambda row: indicators.supek_gpuh(institution=row.short_name)[0],
            axis=1
        )

        data["padobran"] = data.apply(
            lambda row: indicators.padobran(institution=row.short_name)[0],
            axis=1
        )

        data["n_supek_cpuh"] = data.apply(
            lambda row: indicators.supek_gpuh(institution=row.short_name)[2],
            axis=1
        )

        data["n_supek_gpuh"] = data.apply(
            lambda row: indicators.supek_gpuh(institution=row.short_name)[1],
            axis=1
        )

        data["n_padobran"] = data.apply(
            lambda row: indicators.padobran(institution=row.short_name)[1],
            axis=1
        )

        data.drop(["short_name"], axis="columns", inplace=True)

        data.to_csv(options["filename"], index=False, sep="*")
