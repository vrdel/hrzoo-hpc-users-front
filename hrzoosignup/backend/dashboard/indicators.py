import calendar
import datetime

import pytz
from backend import models


class DashboardIndicators:
    def __init__(self, month, year):
        self.start_date = datetime.date(year, month, 1)
        self.end_date = datetime.datetime(
            year, month, calendar.monthrange(year, month)[1], 23, 59, 59,
            tzinfo=pytz.UTC
        )

    def _projects_in_period(self):
        all_projects = models.Project.objects.all()

        return [
            item for item in all_projects if
            item.date_approved <= self.end_date and
            item.date_end >= self.start_date
        ]

    def institutions(self):
        projects = self._projects_in_period()

        active_users = set()
        for project in projects:
            active_users.update([
                item.user.username for item in
                models.UserProject.objects.filter(project=project)
            ])

        institutions_users = set()
        for active_user in active_users:
            user = models.User.objects.get(username=active_user)
            institutions_users.add(user.person_institution)

        institutions_projects = set([item.institute for item in projects])

        institutions_list = institutions_projects.union(institutions_users)

        institutions = dict()
        for item in institutions_list:
            try:
                institute = models.CrorisInstitutions.objects.get(
                    name_short=item
                )

                institutions.update({
                    item: {
                        "oib": institute.oib,
                        "mbu": institute.mbu
                    }
                })

            except models.CrorisInstitutions.DoesNotExist:
                institutions.update({item: {"oib": "", "mbu": ""}})

        return institutions
