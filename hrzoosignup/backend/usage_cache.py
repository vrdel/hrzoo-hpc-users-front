"""Usage cache keys use the login username, as do the accounting builders."""


def user_usage_key(username):
    if not username:
        raise ValueError('A username is required for a usage cache key')
    return f'usage_{username}'


def project_user_usage_key(username):
    if not username:
        raise ValueError('A username is required for a usage cache key')
    return f'project_user_usage_{username}'
