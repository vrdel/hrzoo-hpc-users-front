from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.conf import settings

import argparse
import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "Create additional user with different roles for testing purposes"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="User subcommands", dest="command")
        parser_create = subparsers.add_parser("create", help="Create user based on passed metadata")

        parser_create.add_argument('--first', dest='first', type=str,
                                   required=True, help='First name of user')
        parser_create.add_argument('--last', dest='last', type=str, required=True,
                                   help='Last name of user')
        parser_create.add_argument('--project', dest='project', type=str,
                                   required=True, help='Project identifier that user will be associated to')
        parser_create.add_argument('--pubkey', dest='pubkey',
                                   type=argparse.FileType(), required=True,
                                   help='File path od public key component')
        parser_create.add_argument('--email', dest='email', type=str,
                                   required=True, help='Email of the user')
        parser_create.add_argument('--staff', dest='staff', action='store_true',
                                   default=False,
                                   required=False, help='Flag user as staff')
        parser_create.add_argument('--oib', dest='oib', type=str, required=False,
                                   help='OIB of the user')
        parser_create.add_argument('--password', dest='password', type=str, required=False,
                                   help='Password for the user')

    def handle(self, *args, **options):
        import ipdb; ipdb.set_trace()

        pass
