import calendar
import datetime

from backend import models
from backend.utils.accounting import get_active_projects, get_active_users
from django.utils import timezone


class Indicators:
    def __init__(self, month, year):
        self.start_date = timezone.make_aware(
            datetime.datetime(year, month, 1, 0, 0, 0),
            timezone=timezone.get_current_timezone()
        )
        self.end_date = timezone.make_aware(
            datetime.datetime(
            year, month, calendar.monthrange(year, month)[1], 23, 59, 59),
            timezone=timezone.get_current_timezone()
        )

    def _projects_in_period(self):
        return get_active_projects(
            start_date=self.start_date, end_date=self.end_date
        )

    def _projects(self, institution):
        return [
            item for item in self._projects_in_period() if
            item.institute == institution
        ]

    def _supek_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="supek"
        )

    def _vrancic_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="cloud"
        )

    def _jupyter_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="jupyter"
        )

    def _padobran_usage(self, institution):
        return models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="padobran"
        )


class DashboardIndicators(Indicators):
    def institutions(self):
        projects = self._projects_in_period()

        active_users = set()
        for project in projects:
            active_users.update([
                item.user.username for item in
                models.UserProject.objects.filter(project=project)
            ])

        institutions_users = set()
        for user in get_active_users(
                start_date=self.start_date, end_date=self.end_date
        ):
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

    @staticmethod
    def _get_university_components(university):
        return [
            institution.name_short for institution in
            models.CrorisInstitutions.objects.filter(parent=university)
        ]

    def projects(self, institution):
        return len(self._projects(institution=institution))

    def aggregated_projects(self, university):
        return sum([
            self.projects(institution) for institution in
            self._get_university_components(university)
        ])

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

    def aggregated_users(self, university):
        return sum([
            self.users(institution) for institution in
            self._get_university_components(university)
        ])

    def supek_cpu(self, institution):
        return round(sum(
            float(item.accounting_record["cpuh"]) for item
            in self._supek_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_supek_cpu(self, university):
        return sum(
            self.supek_cpu(institution) for institution in
            self._get_university_components(university)
        )

    def supek_gpu(self, institution):
        return round(sum(
            float(item.accounting_record["gpuh"]) for item
            in self._supek_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_supek_gpu(self, university):
        return sum([
            self.supek_gpu(institution) for institution in
            self._get_university_components(university)
        ])

    def vrancic_cpu(self, institution):
        return round(sum(
            float(item.accounting_record["cpuh"]) for item in
            self._vrancic_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_vrancic_cpu(self, university):
        return sum([
            self.vrancic_cpu(institution) for institution in
            self._get_university_components(university)
        ])

    def vrancic_gpu(self, institution):
        return round(sum(
            float(item.accounting_record["gpuh"]) for item in
            self._vrancic_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_vrancic_gpu(self, university):
        return sum([
            self.vrancic_gpu(institution) for institution in
            self._get_university_components(university)
        ])

    def padobran(self, institution):
        return round(sum(
            float(item.accounting_record["cpuh"]) for item in
            self._padobran_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_padobran(self, university):
        return sum([
            self.padobran(institution) for institution in
            self._get_university_components(university)
        ])

    def jupyter_cpu(self, institution):
        return round(sum(
            float(item.accounting_record["jupyter_cpu_h"]) for item in
            self._jupyter_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_jupyter_cpu(self, university):
        return sum([
            self.jupyter_cpu(institution) for institution in
            self._get_university_components(university)
        ])

    def jupyter_gpu(self, institution):
        return round(sum(
            float(item.accounting_record["jupyter_gpu_h"]) for item in
            self._jupyter_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ), 2)

    def aggregated_jupyter_gpu(self, university):
        return sum([
            self.jupyter_gpu(institution) for institution in
            self._get_university_components(university)
        ])


class CaffeIndicators(Indicators):
    def institutions(self):
        return list(set(item.institute for item in self._projects_in_period()))

    def _supek_cpuh(self, institution):
        return [
            float(item.accounting_record["cpuh"]) for item
            in self._supek_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ]

    def supek_cpuh(self, institution):
        supek_usage = self._supek_cpuh(institution)
        return round(sum(supek_usage), 2)

    def _supek_gpuh(self, institution):
        return [
            float(item.accounting_record["gpuh"]) for item
            in self._supek_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ]

    def supek_gpuh(self, institution):
        supek_usage = self._supek_gpuh(institution)
        gpu_jobs = [item for item in supek_usage if item != 0]
        return (
            round(sum(supek_usage), 2),
            len(gpu_jobs),
            len(supek_usage) - len(gpu_jobs)
        )

    def _padobran_cpuh(self, institution):
        return [
            float(item.accounting_record["cpuh"]) for item in
            self._padobran_usage(institution) if
            self.start_date <= item.end_time <= self.end_date
        ]

    def padobran(self, institution):
        usage = self._padobran_cpuh(institution)
        return round(sum(usage), 2), len(usage)
