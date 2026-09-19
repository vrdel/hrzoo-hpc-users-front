"""Compatibility key builders; usage is keyed by login username."""
from backend.caching.entries import USER_USAGE, PROJECT_USER_USAGE


def user_usage_key(username):
    return USER_USAGE.key(account=username)


def project_user_usage_key(username):
    return PROJECT_USER_USAGE.key(account=username)
