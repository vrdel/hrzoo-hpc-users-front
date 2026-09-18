"""Shared, best-effort invalidation for user-related response caches.

Call these after a successful mutation. In an atomic block deletion waits for
the outermost commit; rolled-back mutations do not evict shared responses.
Bulk user updates must call user_changed() explicitly (Django emits no signal).
"""

from functools import partial

from django.core.cache import cache
from django.db import transaction


MEMBERSHIP_ENTRIES = (
    'ext-users-projects', 'usersinfoinactive-get', 'usersinfo-get',
    'projects-get-all',
)
SSH_KEY_ENTRIES = (
    'ext-sshkeys', 'usersinfoinactive-get', 'usersinfo-get', 'projects-get-all',
)
USER_ENTRIES = tuple(dict.fromkeys(
    MEMBERSHIP_ENTRIES + SSH_KEY_ENTRIES + ('usersinfo-ops-get',)
))


def _invalidate(keys, using=None):
    keys = tuple(dict.fromkeys(keys))
    transaction.on_commit(partial(cache.delete_many, keys), using=using)


def user_changed(using=None):
    _invalidate(USER_ENTRIES, using=using)


def membership_changed(using=None):
    _invalidate(MEMBERSHIP_ENTRIES, using=using)


def ssh_key_changed(using=None):
    _invalidate(SSH_KEY_ENTRIES, using=using)


def project_changed(using=None):
    _invalidate(MEMBERSHIP_ENTRIES, using=using)


def project_extension_changed(using=None):
    # Applying or deleting an extension can also change project state/dates.
    _invalidate(MEMBERSHIP_ENTRIES + ('projectsextends-get-all',), using=using)


def project_calendar_changed(using=None):
    project_changed(using=using)
