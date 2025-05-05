import datetime
from django.contrib.auth import get_user_model


def parse_enddate(dt):
    try:
        if type(dt) is str:
            return datetime.datetime.strptime(dt, '%Y-%m-%d').date()
        else:
            return dt
    except ValueError as exc:
        print('Format end-date not correct')
        print(repr(exc))
        raise SystemExit(1)


def ineligible_users(enddate, graceperiod):
    users = []
    end_date = parse_enddate(enddate)
    user_model = get_user_model()

    for user in user_model.objects.all():
        user_projects_expired = set()
        if not user.status:
            continue
        user_projects = set(list(user.project_set.all().values_list('identifier', flat=True)))
        if not user_projects:
            continue
        for project in user.project_set.all():
            if project.date_end + datetime.timedelta(days=graceperiod) < end_date:
                user_projects_expired.add(project.identifier)
        if not user_projects.difference(user_projects_expired):
            users.append(user)

    return users


