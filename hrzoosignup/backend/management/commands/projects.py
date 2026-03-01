from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project, State

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

        if only_projects:
            with only_projects.open() as fp:
                target_projects = fp.readlines()
            seen_projects = set()
            seen_users = set()
            for project in target_projects:
                found_projects = Project.objects.filter(name=project.strip())
                for target_project in found_projects:
                    if target_project.id in seen_projects:
                        continue
                    seen_projects.add(target_project.id)
                    match.append(target_project)

        else:
            match = Project.objects.all()

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

    def handle(self, *args, **options):
        if options['command'] == 'update':
            self._project_update(options)

        if options['command'] == 'list':
            self._project_list(options)
