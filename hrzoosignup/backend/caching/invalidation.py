"""Shared, best-effort invalidation for user-related response caches.

Call these after a successful mutation. In an atomic block deletion waits for
the outermost commit; rolled-back mutations do not evict shared responses.
Bulk user updates must call user_changed() explicitly (Django emits no signal).
"""

from functools import partial

from django.db import transaction

from . import entries, store


# One dependency mapping for views, commands, signals, and admin writes.
MEMBERSHIP_ENTRIES = tuple(entry.key() for entry in (
    entries.EXTERNAL_MEMBERSHIPS, entries.USERS, entries.INACTIVE_USERS,
    entries.PROJECTS, entries.PROJECT_EXTENSIONS,
))
SSH_KEY_ENTRIES = tuple(entry.key() for entry in (
    entries.EXTERNAL_SSH_KEYS, entries.USERS, entries.INACTIVE_USERS, entries.PROJECTS,
))
USER_ENTRIES = tuple(dict.fromkeys(
    MEMBERSHIP_ENTRIES + SSH_KEY_ENTRIES + (entries.STAFF_USERS.key(),)
))


def _invalidate(keys):
    keys = tuple(dict.fromkeys(keys))
    if keys:
        transaction.on_commit(partial(store.delete_keys, keys))


def user_changed(usage_accounts=()):
    _invalidate(USER_ENTRIES)
    usage_changed(usage_accounts)


def membership_changed(usage_accounts=()):
    _invalidate(MEMBERSHIP_ENTRIES)
    usage_changed(usage_accounts)


def ssh_key_changed():
    _invalidate(SSH_KEY_ENTRIES)


def project_changed(usage_accounts=()):
    _invalidate(MEMBERSHIP_ENTRIES)
    usage_changed(usage_accounts)


def project_extension_changed(usage_accounts=()):
    # Applying or deleting an extension can also change project state/dates.
    _invalidate(MEMBERSHIP_ENTRIES)
    usage_changed(usage_accounts)


def project_calendar_changed():
    project_changed()


def membership_history_changed():
    _invalidate((entries.INACTIVE_USERS.key(),))


def staff_comment_changed():
    _invalidate((entries.PROJECTS.key(),))


def usage_changed(accounts):
    # Resolve iterables before commit, including old usernames before deletion.
    _invalidate(entry.key(account=account)
                for account in tuple(dict.fromkeys(accounts)) if account
                for entry in (entries.USER_USAGE, entries.PROJECT_USER_USAGE, entries.PROJECT_USAGE,
                              entries.LEGACY_PROJECT_USAGE))


def usage_accounts(user_ids=(), project_ids=()):
    """Conservative dependents: members, past resource users, and leaders."""
    from backend import models
    from django.db.models import Q

    project_ids = tuple(project_ids)
    members = models.UserProject.objects.filter(
        project_id__in=project_ids).values('user_id')
    resource_users = models.ResourceUsage.objects.filter(
        project_id__in=project_ids).values('user_id')
    return tuple(models.User.objects.filter(
        Q(pk__in=tuple(user_ids)) | Q(pk__in=members) | Q(pk__in=resource_users)
    ).values_list('username', flat=True))


def usage_records_changed(records):
    records = tuple(records)
    usage_changed(usage_accounts(
        user_ids={record.user_id for record in records if record.user_id},
        project_ids={record.project_id for record in records},
    ))
