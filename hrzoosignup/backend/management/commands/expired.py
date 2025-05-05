from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone
from datetime import date

from backend.models import Project, UserProject, Role
from backend.utils.expired import expired_projects, parse_enddate

import argparse
import datetime
import csv

from rich import print
from rich import box
from rich.columns import Columns
from rich.table import Table
from rich.console import Console
from rich.pretty import pprint


class Command(BaseCommand):
    help = "Expired projects and users"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Expired projects subcommands", dest="command")
        parser.add_argument('--grace-period', dest='graceperiod', type=int, default=180, required=False)
        parser.add_argument('--end-date', dest='enddate', type=str, default=date.today(), required=False)
        parser.add_argument('--export-csv', dest='csvfile', type=str, default=None, required=False)
        parser_projects = subparsers.add_parser("projects", help="Show projects")
        parser_projects.add_argument('--type', dest="project_type", type=str, required=False, help="Project type (research-croris, thesis, practical, internal, srce-workshop)", nargs="+")

    def _expired_projects(self, options):
        projects = expired_projects(options.get('enddate'),
                                    options.get('graceperiod'),
                                    options.get('project_type', None))
        self.end_date = parse_enddate(options.get('enddate'))

        table = Table(
            title="Expired projects",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("Name")
        table.add_column("Identifier")
        table.add_column("Type")
        table.add_column("End")
        table.add_column("Gracedays")
        table.add_column("Users")

        i = 1
        for project in projects:
            days_since_expire = self.end_date - project.date_end
            if days_since_expire < datetime.timedelta(days=options['graceperiod']):
                gracedays = datetime.timedelta(days=options['graceperiod']) - days_since_expire
                users = ', '.join(
                    [user.username for user in project.users.all()]
                )
                table.add_row(str(i), f'{project.name}', f'{project.identifier}', f'{project.project_type.name}', f'{project.date_end}', f'{gracedays.days}', f'{users}')
                i += 1

        if table.row_count:
            console = Console()
            console.print(table)

        if options['csvfile']:
            try:
                with open(options['csvfile'], 'w', newline='') as csvfile:
                    fieldnames = ['#', 'Name', 'Identifier', 'Type', 'End', 'Gracedays', 'Users']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    i = 1
                    for project in projects:
                        gracedays = datetime.timedelta(days=options['graceperiod']) - days_since_expire
                        users = ', '.join(
                            [user.username for user in project.users.all()]
                        )
                        writer.writerow({
                            '#': str(i),
                            'Name': project.name,
                            'Identifier': project.identifier,
                            'Type': project.project_type.name,
                            'End': project.date_end,
                            'Gracedays': gracedays.days,
                            'Users': users
                        })
                        i += 1

            except OSError as exc:
                self.style.ERROR(f'Cannot open {csvfile} for writing - {repr(exc)}')
                raise SystemExit(1)

    def handle(self, *args, **options):
        if options['command'] == 'projects':
            self._expired_projects(options)
