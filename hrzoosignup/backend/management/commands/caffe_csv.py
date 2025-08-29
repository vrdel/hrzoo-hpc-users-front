import sys

import pandas as pd
from backend.dashboard.indicators import CaffeIndicators
from backend.utils.accounting import get_institute_long_name, short2long
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Export monthly usage data for Advanced Computing Caffe"

    def add_arguments(self, parser):
        parser.add_argument(
            "-s", "--start-date", type=str, dest="start_date",
            help="start date in format YYYY-MM-DD"
        )
        parser.add_argument(
            "-e", "--end-date", type=str, dest="end_date",
            help="end date in format YYYY-MM-DD"
        )
        parser.add_argument(
            "-f", "--filename", type=str, dest="filename", help="file name"
        )

    def handle(self, *args, **options):
        try:
            indicators = CaffeIndicators(
                start_date=options["start_date"],
                end_date=options["end_date"]
            )

            institution_long_names = get_institute_long_name()

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
                supek_gpuh.append(
                    indicators.supek_gpuh(institution=short_name)[0]
                )
                padobran.append(indicators.padobran(institution=short_name)[0])
                n_supek_cpuh.append(
                    indicators.supek_gpuh(institution=short_name)[2]
                )
                n_supek_gpuh.append(
                    indicators.supek_gpuh(institution=short_name)[1]
                )
                n_padobran.append(
                    indicators.padobran(institution=short_name)[1]
                )

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

        except Exception as e:
            print(str(e))
            sys.exit(2)
