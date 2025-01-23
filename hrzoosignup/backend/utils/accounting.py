from backend import models
from django.conf import settings
from django.db.models import Q


def get_field(item, field):
    if item["resource_name"] == "jupyter" and field in ["cpuh", "gpuh"]:
        field = f"jupyter_{field[0:3]}_h"

    try:
        return item["accounting_record"][field]

    except KeyError:
        return None


def get_wait_time(item):
    try:
        return get_field(item, "wait_time")

    except TypeError:
        return None


def job_tag(item):
    if item.resource_name in ["supek", "padobran"]:
        if "gpu" in item["accounting_record"]["queue"]:
            return "GPU"

        else:
            return "CPU"

    else:
        return None


def _get_realm_from_mapping(institution):
    mapping = [
        item["to"] for item in settings.MAP_REALMS if
        item["from"] == institution
    ]
    if len(mapping) > 0:
        return mapping[0]

    else:
        return ""


def institutions_realms_dict():
    institutions = dict()
    for item in models.CrorisInstitutions.objects.all():
        institutions.update({item.name_long: item.realm})
        if item.name_short != item.name_long:
            institutions.update({item.name_short: item.realm})

    return institutions


def get_realm(institutions, institution):
    try:
        realm = institutions[institution]

        if not realm:
            realm = _get_realm_from_mapping(institution)

    except KeyError:
        try:
            realm = _get_realm_from_mapping(institution)

        except KeyError:
            return ""

    return realm


def get_finance(item):
    try:
        return item["project__croris_finance"][0]

    except TypeError:
        return ""


def get_instance_id(item):
    try:
        return get_field(item, "instance_id")

    except KeyError:
        return ""


def get_active_projects(start_date, end_date):
    return models.Project.objects.filter(
        (Q(date_end__gte=start_date) | Q(bogus_end__gte=start_date)) &
        Q(date_approved__lte=end_date) &
        ~Q(state__name__in=["submit", "deny"])
    )


def get_users_in_project(project_identifier):
    project = models.Project.objects.get(identifier=project_identifier)

    return [
        user for user in project.users.all() if
        user.person_institution not in ["", "Nepoznato"]
    ]


def get_active_users(start_date, end_date):
    users = list()
    for project in get_active_projects(
            start_date=start_date, end_date=end_date
    ):
        users.extend(
            get_users_in_project(project_identifier=project.identifier)
        )

    return list(set(users))
