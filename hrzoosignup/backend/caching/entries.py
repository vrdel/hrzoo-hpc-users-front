"""Storage policy. Preserve legacy keys and TTLs during the worker migration."""
from dataclasses import dataclass
from hashlib import sha256

from django.core.cache.backends.base import DEFAULT_TIMEOUT


@dataclass(frozen=True)
class Entry:
    name: str
    pattern: str
    timeout: object
    parameter: str = None

    def key(self, **params):
        expected = {self.parameter} if self.parameter else set()
        if set(params) != expected or any(value is None or value == '' for value in params.values()):
            raise ValueError(f'{self.name} requires parameters {sorted(expected)}')
        key = self.pattern.format(**params)
        # Leave room for Django's backend prefix/version. Never expose arbitrary
        # whitespace or unbounded identifiers to Memcached.
        if len(key.encode('utf-8')) > 180 or any(ord(c) <= 32 or ord(c) == 127 for c in key):
            return f'{self.name}:{sha256(key.encode()).hexdigest()}'
        return key


USERS = Entry('users', 'usersinfo-get', None)
INACTIVE_USERS = Entry('inactive_users', 'usersinfoinactive-get', 15 * 60)
STAFF_USERS = Entry('staff_users', 'usersinfo-ops-get', None)
PROJECTS = Entry('projects', 'projects-get-all', None)
PROJECT_EXTENSIONS = Entry('project_extensions', 'projectsextends-get-all', None)
EXTERNAL_MEMBERSHIPS = Entry('external_memberships', 'ext-users-projects', None)
EXTERNAL_SSH_KEYS = Entry('external_ssh_keys', 'ext-sshkeys', None)
CRORIS_PERSON = Entry('croris_person', '{oib}_croris', 20 * 60, 'oib')
USER_USAGE = Entry('user_usage', 'usage_{account}', None, 'account')
PROJECT_USER_USAGE = Entry('project_user_usage', 'project_user_usage_{account}', DEFAULT_TIMEOUT, 'account')
# Cleanup only: ProjectUsage computes live data and no longer warms this entry.
LEGACY_PROJECT_USAGE = Entry('legacy_project_usage', 'project_usage_{account}', DEFAULT_TIMEOUT, 'account')
