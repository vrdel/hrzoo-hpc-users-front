from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.models import Project, State

from backend.utils.accounting import get_realm, institutions_realms_dict

import datetime
import pathlib

from rich import box
from rich.console import Console
from rich.table import Table


class Command(BaseCommand):
    help = "Project management tool"

    def _project_update(self, options):
        project = None

        try:
            project = Project.objects.get(
                identifier=options['identifier'],
            )

        except Project.DoesNotExist as exc:
            self.stdout.write(self.style.ERROR('Project not found'))
            self.stdout.write(self.style.NOTICE(repr(exc)))
            raise SystemExit(1)

        if options['state']:
            try:
                state = State.objects.get(name=options['state'])
                project.state = state
                self.stdout.write('Project {} state updated to {}'.format(project.identifier, state.name))
                cache.delete("ext-users-projects")
                cache.delete('projects-get-all')

            except Project.DoesNotExist as exc:
                self.stdout.write(self.style.ERROR('Project does not exist'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

            except State.DoesNotExist as exc:
                self.stdout.write(self.style.ERROR('State does not exist'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

        project.save()

    def _project_list(self, options):
        table = Table(
            title="List of projects",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("Name")
        table.add_column("Identifier")
        table.add_column("Type")
        table.add_column("Active")

        match = list()
        only_projects = options.get('onlyprojects', None)
        list_by_year = options.get('target_year', None)

        if only_projects:
            with only_projects.open() as fp:
                target_projects = fp.readlines()
            seen_projects = set()
            seen_users = set()
            for project in target_projects:
                if list_by_year:
                    year = int(list_by_year)
                    start_date = datetime.date(year, 1, 1)
                    end_date = datetime.date(year, 12, 31)
                    query = Q(name=project.strip()) & ~Q(state__name__in=["submit", "deny"]) \
                            & (Q(date_end__gte=start_date) | Q(bogus_end__gte=start_date)) \
                            & Q(date_approved__lte=end_date)
                else:
                    query = Q(name=project.strip()) & ~Q(state__name__in=["submit", "deny"])
                found_projects = Project.objects.filter(query)
                # found_projects = Project.objects.filter(name=project.strip())
                for target_project in found_projects:
                    if target_project.id in seen_projects:
                        continue
                    seen_projects.add(target_project.id)
                    match.append(target_project)

        else:
            if list_by_year:
                year = int(list_by_year)
                start_date = datetime.date(year, 1, 1)
                end_date = datetime.date(year, 12, 31)
                query = (Q(date_end__gte=start_date) | Q(bogus_end__gte=start_date)) \
                        & Q(date_approved__lte=end_date) \
                        & ~Q(state__name__in=["submit", "deny"])
                match = Project.objects.filter(query)
            else:
                match = Project.objects.all()

        nrreport = options.get('nrreport', None)
        onlyname = bool(options['onlyname'])
        if nrreport:
            for project in match:
                institutions = institutions_realms_dict()
                get_realm(institutions, project.institute)
                print(project.name, f"({get_realm(institutions, project.institute)})", project.project_type.name, f" {len(project.users.all())}")
        elif onlyname:
            for project in match:
                print(project.name)
        else:
            i = 1
            for m in match:
                # user_projects = UserProject.objects.filter(user=m)
                table.add_row(str(i), str(m.name), str(m.identifier), str(m.project_type.name), str(m.is_active))
                i += 1

            if table.row_count:
                console = Console()
                console.print(table)

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Project subcommands", dest="command")

        parser_update = subparsers.add_parser("update", help="Update project based on passed metadata")
        parser_update.add_argument('--identifier', dest='identifier', type=str,
                                   required=True, help='Project ID')
        parser_update.add_argument('--state', dest='state', type=str,
                                   required=False, help='Project state to set')

        parser_list = subparsers.add_parser("list", help="List projects based on passed metadata")
        parser_list.add_argument('--only-projects', dest='onlyprojects', type=pathlib.Path, required=False, help="List only users on projects listed in file (project name per line)")
        parser_list.add_argument('--only-name', dest='onlyname', action='store_true', required=False, help="List only project names")
        parser_list.add_argument('--nr-report-format', dest='nrreport', action='store_true', required=False, help="List project names according to format of Napredno racunanje")
        parser_list.add_argument('--year', dest='target_year', type=str, required=False, help="User is local or foreign")

    def handle(self, *args, **options):
        if options['command'] == 'update':
            self._project_update(options)

        if options['command'] == 'list':
            self._project_list(options)
