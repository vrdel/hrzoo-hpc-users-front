from typing import Any, Union


def contains_exception(list: list[Exception]) -> tuple[bool, Any]:
    for a in list:
        if isinstance(a, Exception):
            return (True, a)

    return (False, None)
