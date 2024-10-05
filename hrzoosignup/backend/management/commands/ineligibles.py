from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone
from datetime import date

from backend.models import Project, UserProject, Role

import argparse
import datetime

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
        parser.add_argument('--end-date', dest='enddate', type=str, default=datetime.date.today(), required=False)
        parser_users = subparsers.add_parser("users", help="Show users")
        parser_projects = subparsers.add_parser("projects", help="Show projects")

    def _parse_enddate(self, dt):
        try:
            return datetime.datetime.strptime(dt, '%Y-%m-%d').date()
        except ValueError as exc:
            self.stdout.write(self.style.ERROR('Format end-date not correct'))
            self.stdout.write(self.style.NOTICE(repr(exc)))
            raise SystemExit(1)

    def _ineligble_users(self, options):
        self._ineligble_users = []
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
                self._ineligble_users.append(user)

        table = Table(
            title="Ineligible users",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("First, last name")
        table.add_column("Email")
        table.add_column("Status")
        table.add_column("Projects")
        table.add_column("End")

        i = 1
        for user in self._ineligble_users:
            projects = '\n\n'.join(
                ['{}...{} ({})'.format(user_project[0][0:16], user_project[0][-16:], user_project[1])
                 if len(user_project[0]) > 40 else '{} ({})'.format(user_project[0], user_project[1])
                 for user_project in user.project_set.all().values_list('name', 'identifier')]
            )
            projects_dates = '\n\n'.join(date_end.strftime('%Y-%m-%d') for date_end in user.project_set.all().values_list('date_end', flat=True))
            table.add_row(str(i), f'{user.first_name} {user.last_name}\n{user.username}', f'{user.person_mail}', str(user.status), projects, projects_dates)
            i += 1

        if table.row_count:
            console = Console()
            console.print(table)

    def _ineligible_projects(self, options):
        self.end_date = options.get('enddate')
        pass


    def handle(self, *args, **options):
        if options['command'] == 'users':
            self._ineligble_users(options)

        if options['command'] == 'projects':
            self._ineligible_projects(options)
