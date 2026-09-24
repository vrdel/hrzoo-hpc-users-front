"""Best-effort cache access; never publish transaction-local response data."""
import logging
from time import monotonic

from django.core.cache import cache
from django.db import transaction

logger = logging.getLogger(__name__)
MISS = object()


def get(entry, default=None, **params):
    key = entry.key(**params)
    if transaction.get_connection().in_atomic_block:
        return default
    try:
        value = cache.get(key, MISS)
    except Exception:
        logger.warning('Cache read failed: %s', entry.name)
        return default
    logger.debug('Cache %s: %s', 'miss' if value is MISS else 'hit', entry.name)
    return default if value is MISS else value


def set(entry, value, **params):
    key = entry.key(**params)
    if transaction.get_connection().in_atomic_block:
        return
    try:
        cache.set(key, value, timeout=entry.timeout)
    except Exception:
        logger.warning('Cache write failed: %s', entry.name)


def remember(entry, loader, **params):
    value = get(entry, MISS, **params)
    if value is not MISS:
        return value
    started = monotonic()
    value = loader()
    logger.debug('Cache rebuild: %s seconds=%.3f', entry.name, monotonic() - started)
    set(entry, value, **params)
    return value


def delete_keys(keys):
    keys = tuple(dict.fromkeys(keys))
    if not keys:
        return
    try:
        cache.delete_many(keys)
        logger.debug('Cache invalidation attempted: count=%d', len(keys))
    except Exception:
        # No keys, identifiers, payloads, or exception details in logs.
        logger.warning('Cache invalidation failed: count=%d', len(keys))


def delete(entry, **params):
    transaction.on_commit(lambda key=entry.key(**params): delete_keys((key,)))
