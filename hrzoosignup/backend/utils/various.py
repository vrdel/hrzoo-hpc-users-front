from typing import Any, Union
from itertools import islice


def flatten(nested):
    for item in nested:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)
        else:
            yield item


def contains_exception(list: list[Exception]) -> tuple[bool, Any]:
    for a in list:
        if isinstance(a, Exception):
            return (True, a)

    return (False, None)


def chunk_list(lst, num):
    iterator = iter(lst)
    return iter(lambda: list(islice(iterator, num)), [])
