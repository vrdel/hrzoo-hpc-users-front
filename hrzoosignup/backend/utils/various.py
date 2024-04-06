from typing import Any, Union


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
