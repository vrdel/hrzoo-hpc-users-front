import datetime

from backend import models
from django.utils import timezone


def create_mock_db():
    state1 = models.State.objects.create(
        name="approve"
    )
    models.State.objects.create(
        name="submit"
    )
    models.State.objects.create(
        name="deny"
    )
    models.State.objects.create(
        name="extend"
    )
    state5 = models.State.objects.create(
        name="expire"
    )
    project1 = models.Project.objects.create(
        identifier="project-1",
        name="Project name 1",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_end=datetime.date(2024, 7, 31)
    )
    project2 = models.Project.objects.create(
        identifier="project-2",
        name="Project name 2",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_end=datetime.date(2025, 12, 31)
    )
    project3 = models.Project.objects.create(
        identifier="project-3",
        name="Project name 3",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_end=datetime.date(2025, 5, 1)
    )
    project4 = models.Project.objects.create(
        identifier="project-4",
        name="Project name 4",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state5,
        date_end=datetime.date(2024, 6, 30)
    )
    user1 = models.User.objects.create_user(
        username="user1",
        person_username="user1",
        status=True,
        mailinglist_subscribe=True
    )
    user2 = models.User.objects.create_user(
        username="user2",
        person_username="user2",
        status=True,
        mailinglist_subscribe=True
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1704095030),  # 1 Jan 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "1",
            "walltime": 425,
            "ncpus": "16",
            "start_time": 1704094605,
            "queue": "gpu",
            "wait_time": 2,
            "qtime": 1717,
            "ngpus": "1",
            "cpuh": 1.8889,
            "gpuh": 0.1181,
            "month": "01/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1717849428),  # 8 Jun 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "1",
            "walltime": 392,
            "ncpus": "4",
            "start_time": 1717845508,
            "queue": "gpu",
            "wait_time": 2,
            "qtime": 1717796832,
            "ngpus": "2",
            "cpuh": 0.4356,
            "gpuh": 0.2178,
            "month": "06/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project2,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1715938231),  # 17 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "2",
            "walltime": 23423,
            "ncpus": "18",
            "start_time": 1715914808,
            "queue": "queue1",
            "wait_time": 2,
            "qtime": 5,
            "cpuh": 117.115,
            "gpuh": 0,
            "month": "05/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1716001522),  # 18 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "3",
            "walltime": 10,
            "ncpus": "18",
            "start_time": 1716001512,
            "queue": "queue1",
            "wait_time": 2,
            "qtime": 0,
            "cpuh": 0.05,
            "gpuh": 0,
            "month": "05/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project4,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1716368913),  # 22 May 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "4",
            "walltime": "78",
            "ncpus": "70",
            "start_time": "1716368835",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 1.5167,
            "gpuh": 0,
            "month": "05/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1719491452),  # 27 Jun 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "5",
            "walltime": 1234,
            "start_time": 1719490218,
            "queue": "queue1",
            "wait_time": 2,
            "qtime": 5,
            "ngpu": 4,
            "cpuh": 0,
            "gpuh": 1.3711,
            "month": "06/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user2,
        project=project3,
        resource_name="padobran",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1720520659),  # 9 Jul 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "12843",
            "walltime": "13",
            "ncpus": "2",
            "start_time": "1720520646",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 0.0072,
            "gpuh": 0,
            "month": "07/2024"
        }
    )
    models.ResourceUsage.objects.create(
        user=user1,
        project=project2,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1721641019),  # 22 Jul 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "6",
            "walltime": "123",
            "ngpus": "4",
            "start_time": "1721640896",
            "queue": "queue2",
            "wait_time": "4",
            "qtime": "8",
            "cpuh": 0,
            "gpuh": 0.1367,
            "month": "07/2024"
        }
    )
