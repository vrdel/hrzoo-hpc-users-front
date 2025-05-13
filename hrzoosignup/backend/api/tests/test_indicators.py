import datetime

from backend import models
from backend.dashboard.indicators import DashboardIndicators, CaffeIndicators
from django.test import TestCase
from django.utils import timezone
from django.utils.timezone import get_current_timezone

from .test_utils import create_mock_db


class DashboardTests(TestCase):
    def setUp(self):
        create_mock_db()
        user1 = models.User.objects.get(username="user119@fer.hr")
        user5 = models.User.objects.get(username="user42@fer.hr")
        user7 = models.User.objects.get(username="delboy@pmf.hr")

        project1 = models.Project.objects.get(identifier="project-1")
        project3 = models.Project.objects.get(identifier="project-3")
        project4 = models.Project.objects.get(identifier="project-4")

        models.ResourceUsage.objects.create(
            user=user1,
            project=project1,
            resource_name="supek",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1716376320),  # 22 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "7",
                "walltime": 232141,
                "start_time": 1716144179,
                "queue": "queue1",
                "wait_time": 2,
                "qtime": 5,
                "ngpu": 4,
                "cpuh": 0,
                "gpuh": 48
            }
        )
        models.ResourceUsage.objects.create(
            user=user5,
            project=project3,
            resource_name="supek",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1715685120),  # 14 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "7",
                "walltime": 214135,
                "start_time": 1715470985,
                "queue": "queue1",
                "wait_time": 17,
                "qtime": 4321,
                "ngpu": 4,
                "cpuh": 0,
                "gpuh": 128
            }
        )
        models.ResourceUsage.objects.create(
            user=user7,
            project=project1,
            resource_name="padobran",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1720520659),  # 9 Jul 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "12844",
                "walltime": "23",
                "ncpus": "2",
                "start_time": "1720520646",
                "queue": "queue2",
                "wait_time": "4",
                "qtime": "8",
                "cpuh": 74,
                "gpuh": 0
            }
        )
        models.ResourceUsage.objects.create(
            project=project4,
            resource_name="cloud",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1716376320),  # 22 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "start_time": 1716328801,
                "instance_id": "122132132424312",
                "vcpus": 16,
                "started_at": 1716184372,
                "ended_at": None,
                "ngpus": 2,
                "flavor": "m1.gpu.1",
                "cpuh": 211.1956,
                "gpuh": 26.3994
            }
        )
        models.ResourceUsage.objects.create(
            project=project1,
            resource_name="cloud",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1715690970),  # 14 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "start_time": 1715637601,
                "instance_id": "d591480f-6e2b-4817-9c54-b12d0d2d731f",
                "vcpus": 4,
                "ngpus": 3,
                "started_at": 1715599902,
                "ended_at": None,
                "flavor": "m1.half.windows",
                "cpuh": 29.6494,
                "gpuh": 44.4742
            }
        )
        models.ResourceUsage.objects.create(
            project=project1,
            resource_name="cloud",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1715690970),  # 14 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "start_time": 1715637601,
                "instance_id": "13241243135132",
                "vcpus": 64,
                "ngpus": None,
                "started_at": 1719313795,
                "ended_at": 1727761972,
                "flavor": "m1.medium",
                "gpuh": 0,
                "cpuh": 504.3733
            }
        )
        models.ResourceUsage.objects.create(
            project=project1,
            user=user1,
            resource_name="jupyter",
            end_time=timezone.make_aware(
                datetime.datetime(2024, 5, 17, 23, 48, 43),
                timezone=get_current_timezone()
            ),
            accounting_record={
                "jupyter_cpu_h": 17.17,
                "jupyter_gpu_h": 0
            }
        )
        models.ResourceUsage.objects.create(
            project=project1,
            user=user1,
            resource_name="jupyter",
            end_time=timezone.make_aware(
                datetime.datetime(2024, 5, 14, 14, 23, 48),
                timezone=get_current_timezone()
            ),
            accounting_record={
                "jupyter_cpu_h": 0.73,
                "jupyter_gpu_h": 7.18
            }
        )
        models.ResourceUsage.objects.create(
            project=project1,
            user=user7,
            resource_name="jupyter",
            end_time=timezone.make_aware(
                datetime.datetime(2024, 5, 14, 14, 23, 48),
                timezone=get_current_timezone()
            ),
            accounting_record={
                "jupyter_cpu_h": 13.73,
                "jupyter_gpu_h": 8.23
            }
        )
        self.indicators5 = DashboardIndicators(month=5, year=2024)
        self.indicators7 = DashboardIndicators(month=7, year=2024)

    def test_institutions(self):
        self.assertEqual(
            self.indicators5.institutions(), {
                "Fakultet elektrotehnike i računarstva": {
                    "oib": "57029260362",
                    "mbu": "036"
                },
                "Prirodoslovno-matematički fakultet, Zagreb": {
                    "oib": "28163265527",
                    "mbu": "119"
                },
                "Daily Bugle": {
                    "oib": "",
                    "mbu": ""
                }
            }
        )
        self.assertEqual(
            self.indicators7.institutions(), {
                "Fakultet elektrotehnike i računarstva": {
                    "oib": "57029260362",
                    "mbu": "036"
                },
                "Prirodoslovno-matematički fakultet, Zagreb": {
                    "oib": "28163265527",
                    "mbu": "119"
                },
                "Daily Bugle": {
                    "oib": "",
                    "mbu": ""
                }
            }
        )

    def test_projects(self):
        self.assertEqual(
            self.indicators5.projects(
                institution="Fakultet elektrotehnike i računarstva"
            ),
            4
        )
        self.assertEqual(
            self.indicators5.projects(
                institution="Prirodoslovno-matematički fakultet, Zagreb",
            ),
            1
        )
        self.assertEqual(
            self.indicators7.projects(
                institution="Prirodoslovno-matematički fakultet, Zagreb",
            ),
            1
        )

    def test_aggregated_projects(self):
        self.assertEqual(
            self.indicators5.aggregated_projects(
                university="Sveučilište u Zagrebu"
            ), 5
        )
        self.assertEqual(
            self.indicators7.aggregated_projects(
                university="Sveučilište u Zagrebu"
            ), 6
        )

    def test_users(self):
        self.assertEqual(
            self.indicators5.users(
                institution="Fakultet elektrotehnike i računarstva"
            ),
            4
        )
        self.assertEqual(
            self.indicators5.users(
                institution="Prirodoslovno-matematički fakultet, Zagreb"
            ),
            3
        )
        self.assertEqual(
            self.indicators7.users(
                institution="Prirodoslovno-matematički fakultet, Zagreb"
            ),
            3
        )

    def test_aggregated_users(self):
        self.assertEqual(
            self.indicators5.aggregated_users(
                university="Sveučilište u Zagrebu"
            ), 7
        )
        self.assertEqual(
            self.indicators7.aggregated_users(
                university="Sveučilište u Zagrebu"
            ), 9
        )

    def test_supek_cpuh(self):
        self.assertEqual(
            self.indicators5.supek_cpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 5
        )

    def test_aggregated_supek_cpu(self):
        self.assertEqual(
            self.indicators5.aggregated_supek_cpu(
                university="Sveučilište u Zagrebu"
            ), 6.52
        )
        self.assertEqual(
            self.indicators7.aggregated_supek_cpu(
                university="Sveučilište u Zagrebu"
            ), 0
        )

    def test_supek_gpu(self):
        self.assertEqual(
            self.indicators5.supek_gpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 176
        )

    def test_aggregated_supek_gpu(self):
        self.assertEqual(
            self.indicators5.aggregated_supek_gpu(
                university="Sveučilište u Zagrebu"
            ), 176
        )
        self.assertEqual(
            self.indicators7.aggregated_supek_gpu(
                university="Sveučilište u Zagrebu"
            ), 0.14
        )

    def test_padobran(self):
        self.assertEqual(
            self.indicators7.padobran(
                institution="Fakultet elektrotehnike i računarstva"
            ), 74.01
        )

    def test_aggregated_padobran(self):
        self.assertEqual(
            self.indicators5.aggregated_padobran(
                university="Sveučilište u Zagrebu"
            ), 0
        )
        self.assertEqual(
            self.indicators7.aggregated_padobran(
                university="Sveučilište u Zagrebu"
            ), 74.01
        )

    def test_vrancic_cpu(self):
        self.assertEqual(
            self.indicators5.vrancic_cpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 534.02
        )

    def test_aggregated_vrancic_cpu(self):
        self.assertEqual(
            self.indicators5.aggregated_vrancic_cpu(
                university="Sveučilište u Zagrebu"
            ), 745.22
        )
        self.assertEqual(
            self.indicators7.aggregated_vrancic_cpu(
                university="Sveučilište u Zagrebu"
            ), 0
        )

    def test_vrancic_gpu(self):
        self.assertEqual(
            self.indicators5.vrancic_gpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 44.47
        )

    def test_aggregated_vrancic_gpu(self):
        self.assertEqual(
            self.indicators5.aggregated_vrancic_gpu(
                university="Sveučilište u Zagrebu"
            ), 70.87
        )
        self.assertEqual(
            self.indicators7.aggregated_vrancic_gpu(
                university="Sveučilište u Zagrebu"
            ), 0
        )

    def test_jupyter_cpu(self):
        self.assertEqual(
            self.indicators5.jupyter_cpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 31.63
        )

    def test_aggregated_jupyter_cpu(self):
        self.assertEqual(
            self.indicators5.aggregated_jupyter_cpu(
                university="Sveučilište u Zagrebu"
            ), 31.63
        )
        self.assertEqual(
            self.indicators7.aggregated_jupyter_cpu(
                university="Sveučilište u Zagrebu"
            ), 5.17
        )

    def test_jupyter_gpu(self):
        self.assertEqual(
            self.indicators5.jupyter_gpu(
                institution="Fakultet elektrotehnike i računarstva"
            ), 15.41
        )

    def test_aggregated_jupyter_gpu(self):
        self.assertEqual(
            self.indicators5.aggregated_jupyter_gpu(
                university="Sveučilište u Zagrebu"
            ), 15.41
        )
        self.assertEqual(
            self.indicators7.aggregated_jupyter_gpu(
                university="Sveučilište u Zagrebu"
            ), 3.43
        )

class CaffeIndicatorsTests(TestCase):
    def setUp(self):
        create_mock_db()
        user1 = models.User.objects.get(username="user119@fer.hr")
        user5 = models.User.objects.get(username="user42@fer.hr")
        user7 = models.User.objects.get(username="delboy@pmf.hr")

        project1 = models.Project.objects.get(identifier="project-1")
        project3 = models.Project.objects.get(identifier="project-3")
        project4 = models.Project.objects.get(identifier="project-4")

        models.ResourceUsage.objects.create(
            user=user1,
            project=project1,
            resource_name="supek",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1716376320),  # 22 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "7",
                "walltime": 232141,
                "start_time": 1716144179,
                "queue": "queue1",
                "wait_time": 2,
                "qtime": 5,
                "ngpu": 4,
                "cpuh": 0,
                "gpuh": 48
            }
        )
        models.ResourceUsage.objects.create(
            user=user5,
            project=project3,
            resource_name="supek",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1715685120),  # 14 May 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "7",
                "walltime": 214135,
                "start_time": 1715470985,
                "queue": "queue1",
                "wait_time": 17,
                "qtime": 4321,
                "ngpu": 4,
                "cpuh": 0,
                "gpuh": 128
            }
        )
        models.ResourceUsage.objects.create(
            user=user7,
            project=project1,
            resource_name="padobran",
            end_time=timezone.make_aware(
                datetime.datetime.fromtimestamp(1720520659),  # 9 Jul 2024
                timezone=timezone.get_current_timezone()
            ),
            accounting_record={
                "jobid": "12844",
                "walltime": "23",
                "ncpus": "2",
                "start_time": "1720520646",
                "queue": "queue2",
                "wait_time": "4",
                "qtime": "8",
                "cpuh": 74,
                "gpuh": 0
            }
        )

        self.indicators5 = CaffeIndicators(month=5, year=2024)
        self.indicators7 = CaffeIndicators(month=7, year=2024)

    def test_institutions(self):
        self.assertEqual(
            sorted(self.indicators5.institutions()), [
                "Fakultet elektrotehnike i računarstva",
                "Prirodoslovno-matematički fakultet, Zagreb"
            ]
        )
        self.assertEqual(
            sorted(self.indicators7.institutions()), [
                "Fakultet elektrotehnike i računarstva",
                "Prirodoslovno-matematički fakultet, Zagreb"
            ]
        )

    def test_supek_cpuh(self):
        self.assertEqual(
            self.indicators5.supek_cpuh(
                institution="Fakultet elektrotehnike i računarstva"
            ), 5.
        )

    def test_supek_gpuh(self):
        self.assertEqual(
            self.indicators5.supek_gpuh(
                institution="Fakultet elektrotehnike i računarstva"
            ), (176.0, 2, 1)
        )

    def test_padobran(self):
        self.assertEqual(
            self.indicators5.padobran(
                institution="Fakultet elektrotehnike i računarstva"
            ), (0, 0)
        )
        self.assertEqual(
            self.indicators7.padobran(
                institution="Fakultet elektrotehnike i računarstva"
            ), (74.01, 2)
        )
