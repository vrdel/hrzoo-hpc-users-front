import calendar
import datetime
import math

import pytz
from backend import models


class DashboardIndicators:
    def __init__(self, month, year):
        self.start_date = datetime.date(year, month, 1)
        self.start_datetime = datetime.datetime(
            year, month, 1, 0, 0, 0, tzinfo=pytz.UTC
        )
        self.end_date = datetime.datetime(
            year, month, calendar.monthrange(year, month)[1], 23, 59, 59,
            tzinfo=pytz.UTC
        )

    def _projects_in_period(self):
        active_projects = models.Project.objects.all()

        return [
            item for item in active_projects if
            item.date_approved <= self.end_date and
            (
                item.date_end >= self.start_date or
                item.bogus_end >= self.start_date
            )
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

    def _projects(self, institution):
        return [
            item for item in self._projects_in_period() if
            item.institute == institution
        ]

    def projects(self, institution):
        return len(self._projects(institution=institution))

    def _users(self, institution):
        institution_users = [
            user.username for user in
            models.User.objects.filter(person_institution=institution)
        ]

        projects = [
            project.identifier for project in self._projects_in_period()
        ]

        users = set()
        for user in institution_users:
            if len(
                    models.UserProject.objects.filter(
                        user__username=user,
                        project__identifier__in=projects
                    )
            ) > 0:
                users.add(user)

        return list(users)

    def users(self, institution):
        return len(self._users(institution))

    def _supek_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="supek"
        )

    def supek_cpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["cpuh"]) for item
            in self._supek_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))

    def supek_gpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["gpuh"]) for item
            in self._supek_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))

    def _vrancic_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="cloud"
        )

    def vrancic_cpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["cpuh"]) for item in
            self._vrancic_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))

    def vrancic_gpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["gpuh"]) for item in
            self._vrancic_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))


    def padobran(self, institution):
        usage = models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="padobran"
        )

        return math.floor(sum(
            float(item.accounting_record["cpuh"]) for item in usage if
            self.start_datetime <= item.end_time <= self.end_date
        ))

    def _jupyter_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            user__username__in=self._users(institution),
            resource_name="jupyter"
        )

    def jupyter_cpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["jupyter_cpu_h"]) for item in
            self._jupyter_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))

    def jupyter_gpu(self, institution):
        return math.floor(sum(
            float(item.accounting_record["jupyter_gpu_h"]) for item in
            self._jupyter_usage(institution) if
            self.start_datetime <= item.end_time <= self.end_date
        ))
