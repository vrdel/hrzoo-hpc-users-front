from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project, State


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

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Project subcommands", dest="command")

        parser_update = subparsers.add_parser("update", help="Update project based on passed metadata")
        parser_update.add_argument('--identifier', dest='identifier', type=str,
                                   required=True, help='Project ID')
        parser_update.add_argument('--state', dest='state', type=str,
                                   required=False, help='Project state to set')

    def handle(self, *args, **options):
        if options['command'] == 'update':
            self._project_update(options)
