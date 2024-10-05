from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone
from datetime import date

from backend.models import Project, UserProject, Role

import argparse
import datetime


class Command(BaseCommand):
    help = "Ineligible projects and users"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(help="Ineligible users and projects subcommands", dest="command")
        parser.add_argument('--grace-period', dest='graceperiod', type=int, default=180, required=False)
        parser.add_argument('--end-date', dest='enddate', type=str, default=datetime.date.today(), required=False)
        parser_users = subparsers.add_parser("users", help="Show users")
        parser_projects = subparsers.add_parser("projects", help="Show projects")

    def _parse_enddate(self, dt):
        try:
            return datetime.datetime.strptime(dt, '%Y-%m-%d').date()
        except ValueError as exc:
            self.stdout.write(self.style.ERROR('Format end-date not correct'))
            self.stdout.write(self.style.NOTICE(repr(exc)))
            raise SystemExit(1)


    def _ineligble_users(self, options):
        self._ineligble_users = []
        self.end_date = self._parse_enddate(options.get('enddate'))

        for user in self.user_model.objects.all():
            user_projects_expired = set()
            user_projects = set(list(user.project_set.all().values_list('identifier', flat=True)))
            for project in user.project_set.all():
                if project.date_end + datetime.timedelta(days=options['graceperiod']) < self.end_date:
                    user_projects_expired.add(project.identifier)
            if not user_projects.difference(user_projects_expired):
                self._ineligble_users.append(user)

    def _ineligible_projects(self, options):
        self.end_date = options.get('enddate')
        pass


    def handle(self, *args, **options):
        if options['command'] == 'users':
            self._ineligble_users(options)

        if options['command'] == 'projects':
            self._ineligible_projects(options)
