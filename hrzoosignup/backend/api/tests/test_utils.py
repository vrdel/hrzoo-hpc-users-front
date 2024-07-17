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
    models.State.objects.create(
        name="expire"
    )
    project1 = models.Project.objects.create(
        identifier="project-1",
        name="Project name 1",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1
    )
    project3 = models.Project.objects.create(
        identifier="project-3",
        name="Project name 3",
        institute="Sektor za gubljenje vremena",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1
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
            datetime.datetime.fromtimestamp(1717849428),
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
        project=project1,
        resource_name="supek",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1716001522),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jobid": "2",
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
        user=user2,
        project=project3,
        resource_name="padobran",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1720520659),
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
