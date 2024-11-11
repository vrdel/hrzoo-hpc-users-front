from unidecode import unidecode
from django.conf import settings
from django.contrib.auth import get_user_model
import re


def only_alnum(s: str) -> str:
    return re.sub(r'\W', '', s)


def gen_username(first, last):
    # ASCII convert
    name = only_alnum(unidecode(first.lower()))
    surname = only_alnum(unidecode(last.lower()))
    # take first char of name and first seven from surname
    username = name[0] + surname[:7]
    existing_usernames = get_user_model().objects.all().values_list('person_username', flat=True)

    if username in existing_usernames:
        match = list()
        if len(username) < 8:
            match = list(filter(lambda u: u.startswith(username), existing_usernames))
        else:
            match = list(filter(lambda u: u.startswith(username[:-1]), existing_usernames))

        return username + str(len(match))

    else:
        return username
