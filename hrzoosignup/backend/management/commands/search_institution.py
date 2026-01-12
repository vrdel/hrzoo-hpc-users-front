from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Q

from backend.models import CrorisInstitutions

from rich import box
from rich.console import Console
from rich.table import Table


class Command(BaseCommand):
    help = "Search CroRIS institutions by long name, short name or acronym"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        parser.add_argument('--term', dest='term', type=str, required=False, nargs="+", help="substring that will be search for in the name_long, name_short and acronym")

    def handle(self, *args, **options):
        table = Table(
            title="CroRIS institutons matching query",
            title_justify="left",
            box=box.ASCII,
            show_lines=True,
        )
        table.add_column("#")
        table.add_column("Long")
        table.add_column("Short")
        table.add_column("Acronym")
        table.add_column("OIB")
        table.add_column("MBU")
        table.add_column("Web")
        table.add_column("Email")
        table.add_column("Realm")
        table.add_column("Parent")

        search_term = options.get('term', None)
        if search_term:
            search_term = ' '.join(search_term)

        try:
            query = Q(name_long__icontains=' '.join(options['term'])) | \
                Q(name_short__icontains=' '.join(options['term'])) | \
                Q(name_acronym__icontains=' '.join(options['term']))
            match = CrorisInstitutions.objects.filter(query)

        except CrorisInstitutions.DoesNotExist:
            self.stdout.write(self.style.ERROR('Institutions not found'))
            raise SystemExit(1)

        i = 1
        for m in match:
            table.add_row(str(i), m.name_long, m.name_short, m.name_acronym, m.oib, m.mbu, m.contact_email, m.contact_email, m.realm, m.parent)
            i += 1

        if table.row_count:
            console = Console()
            console.print(table)
