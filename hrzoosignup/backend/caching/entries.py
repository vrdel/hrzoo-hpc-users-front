"""Storage policy. Django KEY_PREFIX supplies the application namespace."""
from dataclasses import dataclass
from hashlib import sha256


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


USERS = Entry('users', 'users:active', None)
INACTIVE_USERS = Entry('inactive_users', 'users:inactive', None)
STAFF_USERS = Entry('staff_users', 'users:staff', None)
PROJECTS = Entry('projects', 'projects:all', None)
PROJECT_EXTENSIONS = Entry('project_extensions', 'projects:extensions', None)
EXTERNAL_MEMBERSHIPS = Entry('external_memberships', 'external:memberships', None)
EXTERNAL_SSH_KEYS = Entry('external_ssh_keys', 'external:ssh-keys', None)
CRORIS_PERSON = Entry('croris_person', 'croris:person:{oib}', 20 * 60, 'oib')
USER_USAGE = Entry('user_usage', 'usage:user:{account}', None, 'account')
PROJECT_USER_USAGE = Entry('project_user_usage', 'usage:leader:per-user:{account}', None, 'account')
PROJECT_USAGE = Entry('project_usage', 'usage:leader:projects:{account}', None, 'account')
