import calendar
import datetime

from backend import models
from backend.utils.accounting import get_active_projects, get_active_users
from django.db.models import Sum, Func, F, DecimalField
from django.utils import timezone


class CastJSONBToFloat(Func):
    function = None
    template = "(%(expressions)s)::float"
    output_field = DecimalField()


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

    def _get_usage(self, institution, resource_name, field):
        result = models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name=resource_name,
            end_time__gte=self.start_date,
            end_time__lte=self.end_date
        ).annotate(
            accounting_field=CastJSONBToFloat(F(f"accounting_record__{field}"))
        ).aggregate(
            total=Sum("accounting_field")
        )["total"]

        if result:
            return round(float(result), 2)

        else:
            return 0

    def supek_cpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="supek",
            field="cpuh"
        )

    def supek_gpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="supek",
            field="gpuh"
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

    def aggregated_supek_cpu(self, university):
        return sum(
            self.supek_cpu(institution) for institution in
            self._get_university_components(university)
        )

    def aggregated_supek_gpu(self, university):
        return sum([
            self.supek_gpu(institution) for institution in
            self._get_university_components(university)
        ])

    def vrancic_cpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="cloud",
            field="cpuh"
        )

    def aggregated_vrancic_cpu(self, university):
        return sum([
            self.vrancic_cpu(institution) for institution in
            self._get_university_components(university)
        ])

    def vrancic_gpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="cloud",
            field="gpuh"
        )

    def aggregated_vrancic_gpu(self, university):
        return sum([
            self.vrancic_gpu(institution) for institution in
            self._get_university_components(university)
        ])

    def padobran(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="padobran",
            field="cpuh"
        )

    def aggregated_padobran(self, university):
        return sum([
            self.padobran(institution) for institution in
            self._get_university_components(university)
        ])

    def jupyter_cpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="jupyter",
            field="jupyter_cpu_h"
        )

    def aggregated_jupyter_cpu(self, university):
        return sum([
            self.jupyter_cpu(institution) for institution in
            self._get_university_components(university)
        ])

    def jupyter_gpu(self, institution):
        return self._get_usage(
            institution=institution,
            resource_name="jupyter",
            field="jupyter_gpu_h"
        )

    def aggregated_jupyter_gpu(self, university):
        return sum([
            self.jupyter_gpu(institution) for institution in
            self._get_university_components(university)
        ])


class CaffeIndicators(Indicators):
    def institutions(self):
        return list(set(item.institute for item in self._projects_in_period()))

    def supek_cpuh(self, institution):
        return self.supek_cpu(institution)

    def supek_gpuh(self, institution):
        supek_usage = self.supek_gpu(institution)
        gpu_jobs = models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="supek",
            end_time__gte=self.start_date,
            end_time__lte=self.end_date
        ).annotate(
            gpuh=CastJSONBToFloat(F(f"accounting_record__gpuh"))
        ).exclude(gpuh=0).count()
        all_jobs = models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="supek",
            end_time__gte=self.start_date,
            end_time__lte=self.end_date
        ).count()
        return (
            supek_usage,
            gpu_jobs,
            all_jobs - gpu_jobs
        )

    def padobran(self, institution):
        usage = self._get_usage(
            institution=institution,
            resource_name="padobran",
            field="cpuh"
        )
        nr_jobs = models.ResourceUsage.objects.filter(
            project__in=self._projects(institution),
            resource_name="padobran",
            end_time__gte=self.start_date,
            end_time__lte=self.end_date
        ).count()
        return usage, nr_jobs
