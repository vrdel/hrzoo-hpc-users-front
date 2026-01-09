from django.core.cache import cache
from django.core.management.base import BaseCommand

from backend.models import Project


class Command(BaseCommand):
    help = "Manage uses_ai_tech flag of project"

    def _project_update(self, options):
        project = None
        any_changed = False

        if options.get('identifier', False):
            try:
                project = Project.objects.get(
                    identifier=options['identifier'],
                )
                project.uses_ai_tech = bool(options['value'])
                project.save()

            except Project.DoesNotExist as exc:
                self.stdout.write(self.style.ERROR('Project ID not found'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

        elif options.get('name', False):
            try:
                if options.get('exact', False):
                    project = Project.objects.get(name__iexact=' '.join(options['name']))
                    project.uses_ai_tech = bool(options['value'])
                    self.stdout.write(f"uses_ai_tech={bool(options['value'])} for {project.identifier} {project.name}")
                    any_changed = True
                    project.save()
                else:
                    projects = Project.objects.filter(name__icontains=' '.join(options['name']))
                    for project in projects:
                        project.uses_ai_tech = bool(options['value'])
                        any_changed = True
                        self.stdout.write(f"uses_ai_tech={bool(options['value'])} for {project.identifier} {project.name}")
                        project.save()

            except Project.DoesNotExist as exc:
                self.stdout.write(self.style.ERROR('Project name not found'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

            except Project.MultipleObjectsReturned as exc:
                self.stdout.write(self.style.ERROR('Multiple projects found'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

        if any_changed:
            cache.delete("ext-users-projects")
            cache.delete("projects-get-all")

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument('--identifier', dest='identifier', type=str,
                            required=False, help='Project ID')
        parser.add_argument('--name', dest='name', type=str, required=False,
                            help='Project name', nargs='+')
        parser.add_argument('--value', dest='value', type=int, default=None, required=True)
        parser.add_argument('--exact', dest='exact', action='store_true', required=False, default=False)

    def handle(self, *args, **options):
        self._project_update(options)
