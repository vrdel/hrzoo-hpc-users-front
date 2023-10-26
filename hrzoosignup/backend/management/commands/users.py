from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone

from backend.models import Project, UserProject, Role

import argparse
import datetime
import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "User management tool"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="User subcommands", dest="command")
        parser_create = subparsers.add_parser("create", help="Create user based on passed metadata")

        parser_create.add_argument('--username', dest='username', type=str,
                                   required=True, help='Username of user')
        parser_create.add_argument('--first', dest='first', type=str,
                                   required=True, help='First name of user')
        parser_create.add_argument('--last', dest='last', type=str, required=True,
                                   help='Last name of user')
        parser_create.add_argument('--project', dest='project', type=str,
                                   required=False, help='Project identifier that user will be associated to')
        parser_create.add_argument('--pubkey', dest='pubkey',
                                   type=argparse.FileType(), required=False,
                                   help='File path od public key component')
        parser_create.add_argument('--email', dest='email', type=str,
                                   required=True, help='Email of the user')
        parser_create.add_argument('--institution', dest='institution', type=str,
                                   required=True, help='Institution of the user')
        parser_create.add_argument('--organisation', dest='organisation', type=str, default='',
                                   required=False, help='Organisation of the user')
        parser_create.add_argument('--staff', dest='staff', action='store_true',
                                   default=False, required=False,
                                   help='Flag user as staff')
        parser_create.add_argument('--oib', dest='oib', type=str, default='',
                                   required=False, help='OIB of the user')
        parser_create.add_argument('--password', dest='password', type=str,
                                   required=False, help='Password for the user')
        parser_create.add_argument('--uniqueid', dest='uniqueid', type=str, default='',
                                   required=True, help='SSO Unique ID of the user')
        parser_create.add_argument('--key-name', dest='keyname', type=str, default='',
                                   required=False, help='SSH key name')
        parser_create.add_argument('--key', dest='key', type=argparse.FileType(), default='',
                                   required=False, help='SSH key')


        parser_delete = subparsers.add_parser("delete", help="Remove user based on passed metadata")

        parser_delete.add_argument('--username', dest='username', type=str,
                                   required=True, help='Username of user')

    def handle(self, *args, **options):
        if options['command'] == 'create':
            user, project = None, None

            if options['project']:
                try:
                    project = Project.objects.get(identifier=options['project'])
                    self.stdout.write('Found project {} \"{}\"'.format(options['project'], project.name))

                except Project.DoesNotExist as exc:
                    self.stdout.write(self.style.ERROR('Project does not exist'))
                    self.stdout.write(self.style.NOTICE(repr(exc)))
                    raise SystemExit(1)

            try:
                user_model = get_user_model()
                user = user_model.objects.create(
                    username=options['username'],
                    first_name=options['first'],
                    last_name=options['last'],
                    person_uniqueid=options['uniqueid'],
                    person_mail=options['email'],
                    croris_first_name=options['first'],
                    croris_last_name=options['last'],
                    croris_mail=options['email'],
                    person_oib=options['oib'],
                    person_institution=options['institution'],
                    person_organisation=options['organisation'],
                )
                self.stdout.write('Created user {}'.format(user.username))
                cache.delete("usersinfoinactive-get")
                cache.delete("usersinfo-get")

            except IntegrityError as exc:
                self.stdout.write(self.style.ERROR('Error creating user'))
                self.stdout.write(self.style.NOTICE(repr(exc)))
                raise SystemExit(1)

            if project and user:
                try:
                    role_colab = Role.objects.get(name='collaborator')
                    UserProject.objects.create(
                        user=user,
                        project=project,
                        role=role_colab,
                        date_joined=timezone.make_aware(datetime.datetime.now())
                    )
                    self.stdout.write('User {} assigned to project {}'.format(user.username, project.identifier))
                    cache.delete("ext-users-projects")
                    cache.delete('projects-get-all')

                except IntegrityError as exc:
                    self.stdout.write(self.style.ERROR('Error assigning user {} to project {}'.format(user.username, project.identifier)))
                    self.stdout.write(self.style.NOTICE(repr(exc)))
                    raise SystemExit(1)
