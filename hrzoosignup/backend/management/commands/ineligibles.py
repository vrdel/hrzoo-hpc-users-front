from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone
from django.utils.crypto import get_random_string

from backend.models import Project, UserProject, Role
from backend.serializers import SshKeysSerializer
from backend.models import SSHPublicKey
from backend.utils.gen_username import gen_username

import argparse
import datetime


class Command(BaseCommand):
    help = "Ineligible projects and users"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Ineligible users and projects subcommands", dest="command")
        parser_users = subparsers.add_parser("users", help="Show users")

        parser_projects = subparsers.add_parser("projects", help="Show projects")

    def handle(self, *args, **options):
        if options['command'] == 'users':
            self._ineligble_users(options)

        if options['command'] == 'projects':
            self._ineligible_projects(options)
