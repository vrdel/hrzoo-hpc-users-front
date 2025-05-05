import datetime

from django.db.models import Q

from backend.models import Project, UserProject, Role


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


def expired_projects(enddate, graceperiod, project_type):
    projects_result = []
    end_date = parse_enddate(enddate)

    projects = []
    target_project_types = project_type
    if target_project_types:
        query = Q()
        for pt in target_project_types:
            query |= Q(project_type__name__contains=pt)
        projects = Project.objects.filter(query).distinct()
    else:
        projects = Project.objects.all()

    for project in projects:
        if project.state.name in ['deny', 'submit', 'expire'] or project.date_end > end_date:
            continue
        if (end_date - project.date_end) < datetime.timedelta(days=graceperiod):
            projects_result.append(project)

    return projects_result
