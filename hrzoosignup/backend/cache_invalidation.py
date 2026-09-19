"""Compatibility import for existing mutation handlers."""
from backend.caching.invalidation import (
    MEMBERSHIP_ENTRIES, SSH_KEY_ENTRIES, USER_ENTRIES,
    user_changed, membership_changed, ssh_key_changed, project_changed,
    project_extension_changed, project_calendar_changed,
    membership_history_changed, staff_comment_changed, usage_changed,
    usage_accounts, usage_records_changed,
)
