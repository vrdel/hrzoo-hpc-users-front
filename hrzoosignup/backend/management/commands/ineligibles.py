from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone
from datetime import date

from backend.models import Project, UserProject, Role

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
    help = "Ineligible projects and users"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Ineligible users and projects subcommands", dest="command")
        parser.add_argument('--grace-period', dest='graceperiod', type=int, default=180, required=False)
        parser.add_argument('--end-date', dest='enddate', type=str, default=date.today(), required=False)
        parser.add_argument('--export-csv', dest='csvfile', type=str, default=None, required=False)
        parser_users = subparsers.add_parser("users", help="Show users")
        parser_projects = subparsers.add_parser("projects", help="Show projects")

    def _parse_enddate(self, dt):
        try:
            if type(dt) is str:
                return datetime.datetime.strptime(dt, '%Y-%m-%d').date()
            else:
                return dt
        except ValueError as exc:
            self.stdout.write(self.style.ERROR('Format end-date not correct'))
            self.stdout.write(self.style.NOTICE(repr(exc)))
            raise SystemExit(1)

    def _ineligible_users(self, options):
        self._users = []
        self.end_date = self._parse_enddate(options.get('enddate'))

        for user in self.user_model.objects.all():
            user_projects_expired = set()
            if not user.status:
                continue
            user_projects = set(list(user.project_set.all().values_list('identifier', flat=True)))
            if not user_projects:
                continue
            for project in user.project_set.all():
                if project.date_end + datetime.timedelta(days=options['graceperiod']) < self.end_date:
                    user_projects_expired.add(project.identifier)
            if not user_projects.difference(user_projects_expired):
                self._users.append(user)

        table = Table(
            title="Ineligible users",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("First, last, username")
        table.add_column("Email")
        table.add_column("Key")
        table.add_column("Projects")
        table.add_column("End")

        i = 1
        for user in self._users:
            projects = '\n\n'.join(
                ['{} ({} - {})'.format(user_project[0], user_project[1], user_project[2])
                 for user_project in user.project_set.all().values_list('name', 'identifier', 'project_type__name')]
            )
            projects_dates = '\n\n'.join(date_end.strftime('%Y-%m-%d') for date_end in user.project_set.all().values_list('date_end', flat=True))
            key_added = len(user.sshpublickey_set.all()) > 0
            table.add_row(str(i), f'{user.first_name} {user.last_name}\n{user.username}', f'{user.person_mail}', str(key_added), projects, projects_dates)
            i += 1

        if table.row_count:
            console = Console()
            console.print(table)

        if options['csvfile']:
            try:
                with open(options['csvfile'], 'w', newline='') as csvfile:
                    fieldnames = ['#', 'First Last Username', 'Email', 'Key', 'Projects', 'End']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    i = 1
                    for user in self._users:

                        projects = ', '.join(
                            ['{} ({} - {})'.format(user_project[0], user_project[1], user_project[2])
                             for user_project in user.project_set.all().values_list('name', 'identifier', 'project_type__name')]
                        )
                        projects_dates = ', '.join(date_end.strftime('%Y-%m-%d') for date_end in user.project_set.all().values_list('date_end', flat=True))
                        key_added = len(user.sshpublickey_set.all()) > 0
                        writer.writerow({
                            '#': str(i),
                            'First Last Username': f'{user.first_name} {user.last_name}, {user.username}',
                            'Email': user.person_mail,
                            'Key': str(key_added),
                            'Projects': projects,
                            'End': projects_dates
                        })
                        i += 1

            except OSError as exc:
                self.style.ERROR(f'Cannot open {csvfile} for writing - {repr(exc)}')
                raise SystemExit(1)

    def _ineligible_projects(self, options):
        self._projects = []
        self.end_date = self._parse_enddate(options.get('enddate'))

        for project in Project.objects.all():
            if project.state.name in ['deny', 'submit', 'expire']:
                continue
            if project.date_end + datetime.timedelta(days=options['graceperiod']) < self.end_date:
                self._projects.append(project)

        table = Table(
            title="Ineligible projects",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("Name")
        table.add_column("Identifier")
        table.add_column("Type")
        table.add_column("End")
        table.add_column("Overextend")
        table.add_column("Users")

        i = 1
        for project in self._projects:
            overextend = (self.end_date - (project.date_end + datetime.timedelta(days=options['graceperiod']))).days
            users = ', '.join(
                [user.username for user in project.users.all()]
            )
            table.add_row(str(i), f'{project.name}', f'{project.identifier}', f'{project.project_type.name}', f'{project.date_end}', f'{overextend}', f'{users}')
            i += 1

        if table.row_count:
            console = Console()
            console.print(table)

        if options['csvfile']:
            try:
                with open(options['csvfile'], 'w', newline='') as csvfile:
                    fieldnames = ['#', 'Name', 'Identifier', 'Type', 'End', 'Overextend', 'Users']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    i = 1
                    for project in self._projects:
                        overextend = (self.end_date - (project.date_end + datetime.timedelta(days=options['graceperiod']))).days
                        users = ', '.join(
                            [user.username for user in project.users.all()]
                        )
                        writer.writerow({
                            '#': str(i),
                            'Name': project.name,
                            'Identifier': project.identifier,
                            'Type': project.project_type.name,
                            'End': project.date_end,
                            'Overextend': overextend,
                            'Users': users
                        })
                        i += 1

            except OSError as exc:
                self.style.ERROR(f'Cannot open {csvfile} for writing - {repr(exc)}')
                raise SystemExit(1)

    def handle(self, *args, **options):
        if options['command'] == 'users':
            self._ineligible_users(options)

        if options['command'] == 'projects':
            self._ineligible_projects(options)
