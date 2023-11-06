from django.core.management.commands.flush import Command as FlushCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

class Command(FlushCommand):
    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            "--yes",
            action="store_true",
            dest="confirmed_yes",
            help="Explicity state to agree to flush the database",
        )

    def handle(self, **options):
        self.stdout.write(self.style.WARNING('Trying to completely flush database'))

        if options.get('confirmed_yes', None):
            options['interactive'] = False
        else:
            self.stdout.write(self.style.ERROR('Run with explicit --yes argument'))
            raise SystemExit(1)

        super(Command, self).handle(**options)
        self.stdout.write(self.style.SUCCESS('Application tables deleted'))

        ContentType.objects.all().delete()
        Permission.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Django tables deleted'))
