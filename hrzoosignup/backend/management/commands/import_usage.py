import json

from backend.utils.usage_data_preparation import Usage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import usage data from json file to the DB"

    def add_arguments(self, parser):
        parser.add_argument(
            "-r", "--resource", dest="resource", type=str, help="resource type",
            required=True
        )
        parser.add_argument(
            "-f", "--file", dest="file", type=str, required=True,
            help="json file containing usage data"
        )

    def handle(self, *args, **options):
        with open(options["file"], "r") as f:
            data = json.load(f)

        usage = Usage(data=data["usage"])

        usage.save(resource=options["resource"])

        error_message = ""
        if len(usage.missing_projects) > 0:
            if len(usage.missing_projects) > 1:
                noun = "projects"

            else:
                noun = "project"

            if not error_message:
                noun = noun.capitalize()

            error_message = (
                f"{error_message}; {noun} "
                f"{', '.join(sorted(list(usage.missing_projects)))} not "
                f"found".strip("; ")
            )

        if len(usage.missing_users) > 0:
            if len(usage.missing_users) > 1:
                noun = "users"
            else:
                noun = "user"

            if not error_message:
                noun = noun.capitalize()

            error_message = (
                f"{error_message}; {noun} "
                f"{', '.join(sorted(list(usage.missing_users)))} not "
                f"found".strip("; ")
            )

        if error_message:
            self.stderr.write(error_message)
