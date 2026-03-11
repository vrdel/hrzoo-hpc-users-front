from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Q
from datetime import date

from backend.models import Project
from backend.utils.expired import expired_projects, expired_users, parse_enddate

import datetime
import csv

from rich import box
from rich.table import Table
from rich.console import Console


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
        _ = subparsers.add_parser("users", help="Show users")
        parser_projects.add_argument('--type', dest="project_type", type=str, required=False, help="Project type (research-croris, thesis, practical, internal, srce-workshop)", nargs="+")
        parser_projects.add_argument('--to-be-expired', dest='tobeexpired', type=int, required=False, help="Show only approved projects whose date_end falls within specified number of days from today")

    def _expired_users(self, options):
        users = expired_users(options.get('enddate'),
                              options.get('graceperiod'))

        table = Table(
            title="Expired users",
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
        for user in users:
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
                    for user in users:

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
            since_expire = self.end_date - project.date_end
            if since_expire < datetime.timedelta(days=options['graceperiod']):
                users = ', '.join(
                    [user.username for user in project.users.all()]
                )
                table.add_row(str(i), f'{project.name}', f'{project.identifier}', f'{project.project_type.name}', f'{project.date_end}', f'{since_expire.days}', f'{users}')
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
                        users = ', '.join(
                            [user.username for user in project.users.all()]
                        )
                        writer.writerow({
                            '#': str(i),
                            'Name': project.name,
                            'Identifier': project.identifier,
                            'Type': project.project_type.name,
                            'End': project.date_end,
                            'Gracedays': since_expire.days,
                            'Users': users
                        })
                        i += 1

            except OSError as exc:
                self.style.ERROR(f'Cannot open {csvfile} for writing - {repr(exc)}')
                raise SystemExit(1)

    def _to_be_expired_projects(self, options):
        today = date.today()
        deadline = today + datetime.timedelta(days=options['tobeexpired'])

        query = Q(state__name='approve') & Q(date_end__gte=today) & Q(date_end__lte=deadline)
        target_project_types = options.get('project_type', None)
        if target_project_types:
            type_query = Q()
            for pt in target_project_types:
                type_query |= Q(project_type__name__contains=pt)
            query &= type_query
        projects = Project.objects.filter(query).distinct()

        table = Table(
            title="Projects to be expired",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("Name")
        table.add_column("Identifier")
        table.add_column("Type")
        table.add_column("End")
        table.add_column("Days left")
        table.add_column("Users")

        i = 1
        for project in projects:
            days_left = (project.date_end - today).days
            users = ', '.join(
                [user.username for user in project.users.all()]
            )
            table.add_row(str(i), f'{project.name}', f'{project.identifier}', f'{project.project_type.name}', f'{project.date_end}', f'{days_left}', f'{users}')
            i += 1

        if table.row_count:
            console = Console()
            console.print(table)

        if options['csvfile']:
            try:
                with open(options['csvfile'], 'w', newline='') as csvfile:
                    fieldnames = ['#', 'Name', 'Identifier', 'Type', 'End', 'Days left', 'Users']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    i = 1
                    for project in projects:
                        days_left = (project.date_end - today).days
                        users = ', '.join(
                            [user.username for user in project.users.all()]
                        )
                        writer.writerow({
                            '#': str(i),
                            'Name': project.name,
                            'Identifier': project.identifier,
                            'Type': project.project_type.name,
                            'End': project.date_end,
                            'Days left': days_left,
                            'Users': users
                        })
                        i += 1

            except OSError as exc:
                self.style.ERROR(f'Cannot open {csvfile} for writing - {repr(exc)}')
                raise SystemExit(1)

    def handle(self, *args, **options):
        if options['command'] == 'projects':
            if options.get('tobeexpired') is not None:
                self._to_be_expired_projects(options)
            else:
                self._expired_projects(options)

        if options['command'] == 'users':
            self._expired_users(options)
