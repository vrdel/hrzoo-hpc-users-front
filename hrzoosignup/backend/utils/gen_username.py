from unidecode import unidecode


def only_alnum(s: str) -> str:
    if '-' in s:
        s = s.split('-')
        s = ''.join(s)
    if ' ' in s:
        s = s.split(' ')
        s = ''.join(s)

    return s


def gen_username(first, last, existusers):
    # ASCII convert
    name = only_alnum(unidecode(first.lower()))
    surname = only_alnum(unidecode(last.lower()))
    # take first char of name and first seven from surname
    username = name[0] + surname[:7]

    if username in existusers:
        match = list()
        if len(username) < 8:
            match = list(filter(lambda u: u.startswith(username), existusers))
        else:
            match = list(filter(lambda u: u.startswith(username[:-1]), existusers))

        return username + str(len(match))

    else:
        return username
