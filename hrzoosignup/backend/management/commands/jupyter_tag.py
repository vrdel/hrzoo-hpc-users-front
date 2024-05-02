from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Add JUPYTER tag in resource_type field if not exist'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--add",
            action="store_true",
            dest="add",
            help="Add JUPYTER tag",
        )
        parser.add_argument(
            "--delete",
            action="store_true",
            dest="del",
            help="Remove JUPYTER tag",
        )

    def handle(self, *args, **options):
        from backend import models
        if options['add']:
            for project in models.Project.objects.all():
                if project.state.name in ['approve', 'extend', 'expire']:
                    resources = project.staff_resources_type
                    if resources:
                        all_tags = [resource['label'] for resource in resources]
                        if 'JUPYTER' not in all_tags:
                            project.staff_resources_type.append({
                                'label': 'JUPYTER',
                                'value': 'JUPYTER'
                            })
                            self.stdout.write(self.style.SUCCESS(f"Added JUPYTER tag for {project.identifier}"))
                            project.save()

        elif options['delete']:
            for project in models.Project.objects.all():
                if project.state.name in ['approve', 'extend', 'expire']:
                    resources = project.staff_resources_type
                    if resources:
                        all_tags = [resource['label'] for resource in resources]
                        if 'JUPYTER' in all_tags:
                            new_tags = [tag for tag in all_tags if tag['value'] != 'JUPYTER']
                            project.staff_resources_type = new_tags
                            self.stdout.write(self.style.SUCCESS(f"Removed JUPYTER tag for {project.identifier}"))
                            project.save()
