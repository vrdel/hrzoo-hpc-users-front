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

        institute = list()
        supek_cpuh = list()
        supek_gpuh = list()
        padobran = list()
        n_supek_cpuh = list()
        n_supek_gpuh = list()
        n_padobran = list()
        for short_name in indicators.institutions():
            institute.append(short2long(institution_long_names, short_name))
            supek_cpuh.append(indicators.supek_cpuh(institution=short_name))
            supek_gpuh.append(indicators.supek_gpuh(institution=short_name)[0])
            padobran.append(indicators.padobran(institution=short_name)[0])
            n_supek_cpuh.append(
                indicators.supek_gpuh(institution=short_name)[2]
            )
            n_supek_gpuh.append(
                indicators.supek_gpuh(institution=short_name)[1]
            )
            n_padobran.append(indicators.padobran(institution=short_name)[1])

        data = pd.DataFrame({
            "institute": institute,
            "supek_cpuh": supek_cpuh,
            "supek_gpuh": supek_gpuh,
            "padobran": padobran,
            "n_supek_cpuh": n_supek_cpuh,
            "n_supek_gpuh": n_supek_gpuh,
            "n_padobran": n_padobran
        })

        data.to_csv(options["filename"], index=False, sep="*")
