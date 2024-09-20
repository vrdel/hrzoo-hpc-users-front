import datetime

import pytz
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
    role1 = models.Role.objects.create(
        name="lead"
    )
    role2 = models.Role.objects.create(
        name="collaborator"
    )
    project1 = models.Project.objects.create(
        identifier="project-1",
        name="Project name 1",
        institute="Fakultet elektrotehnike i računarstva",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_start=datetime.date(2023, 5, 1),
        date_end=datetime.date(2024, 7, 31),
        date_approved=datetime.datetime(2023, 5, 3, 0, 0, 0, tzinfo=pytz.UTC)
    )
    project2 = models.Project.objects.create(
        identifier="project-2",
        name="Project name 2",
        institute="Fakultet elektrotehnike i računarstva",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_start=datetime.date(2024, 5, 7),
        date_end=datetime.date(2025, 12, 31),
        date_approved=datetime.datetime(2024, 6, 9, 12, 0, 13, tzinfo=pytz.UTC)
    )
    project3 = models.Project.objects.create(
        identifier="project-3",
        name="Project name 3",
        institute="Fakultet elektrotehnike i računarstva",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        date_start=datetime.date(2024, 3, 1),
        date_end=datetime.date(2025, 5, 1),
        date_approved=datetime.datetime(2024, 3, 7, 14, 58, 13, tzinfo=pytz.UTC)
    )
    project4 = models.Project.objects.create(
        identifier="project-4",
        name="Project name 4",
        institute="Prirodoslovno-matematički fakultet, Zagreb",
        science_extrasoftware_help=False,
        is_active=True,
        state=state5,
        date_start=datetime.date(2024, 1, 1),
        date_end=datetime.date(2024, 6, 30),
        date_approved=datetime.datetime(2024, 2, 2, 15, 8, 28, tzinfo=pytz.UTC)
    )
    user1 = models.User.objects.create_user(
        username="user119@fer.hr",
        person_uniqueid="user119@fer.hr",
        croris_first_name="Arthur",
        croris_last_name="Dent",
        person_username="adent",
        person_mail="arthur.dent@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user2 = models.User.objects.create_user(
        username="user454@fer.hr",
        person_uniqueid="user454@fer.hr",
        croris_first_name="Tricia",
        croris_last_name="McMillan",
        person_username="tmcmilla",
        person_mail="trillian@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user3 = models.User.objects.create_user(
        username="user45@fer.hr",
        person_uniqueid="user45@fer.hr",
        croris_first_name="Ford",
        croris_last_name="Prefect",
        person_username="fprefect",
        person_mail="ford.prefect@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user4 = models.User.objects.create_user(
        username="user70@fer.hr",
        person_uniqueid="user70@fer.hr",
        croris_first_name="Zaphod",
        croris_last_name="Beeblebrox",
        person_username="zbeebleb",
        person_mail="zb@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user5 = models.User.objects.create_user(
        username="user42@fer.hr",
        person_uniqueid="user42@fer.hr",
        croris_first_name="Marvin",
        croris_last_name="The Paranoid Android",
        person_username="marvin",
        person_mail="marvin@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user6 = models.User.objects.create_user(
        username="user348@fer.hr",
        person_uniqueid="user348@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user7 = models.User.objects.create_user(
        username="delboy@pmf.hr",
        person_uniqueid="delboy@pmf.hr",
        croris_first_name="Derek",
        croris_last_name="Trotter",
        person_username="dtrotter",
        person_mail="delboy@biol.pmf.hr",
        person_institution="Prirodoslovno-matematički fakultet, Zagreb",
        status=True,
        mailinglist_subscribe=True
    )
    user8 = models.User.objects.create_user(
        username="dave@pmf.hr",
        person_uniqueid="dave@pmf.hr",
        croris_first_name="Rodney",
        croris_last_name="Trotter",
        person_username="rtrotter",
        person_mail="dave@biol.pmf.hr",
        person_institution="Prirodoslovno-matematički fakultet, Zagreb",
        status=True,
        mailinglist_subscribe=True
    )
    user9 = models.User.objects.create_user(
        username="uncle_albert@pmf.hr",
        person_uniqueid="uncle_albert@pmf.hr",
        croris_first_name="Albert",
        croris_last_name="Trotter",
        person_username="atrotter",
        person_mail="uncle.albert@biol.pmf.hr",
        person_institution="Prirodoslovno-matematički fakultet, Zagreb",
        status=True,
        mailinglist_subscribe=True
    )
    user10 = models.User.objects.create_user(
        username="j.jameson@daily-bugle.com",
        person_uniqueid="j.jameson@daily-bugle.com",
        person_mail="j.jameson@daily-bugle.com",
        person_username="jjjameso",
        person_institution="Daily Bugle",
        status=False,
        mailinglist_subscribe=True
    )
    models.UserProject.objects.create(
        user=user1,
        project=project1,
        role=role1
    )
    models.UserProject.objects.create(
        user=user1,
        project=project2,
        role=role2
    )
    models.UserProject.objects.create(
        user=user2,
        project=project1,
        role=role2
    )
    models.UserProject.objects.create(
        user=user9,
        project=project1,
        role=role2
    )
    models.UserProject.objects.create(
        user=user3,
        project=project2,
        role=role2
    )
    models.UserProject.objects.create(
        user=user4,
        project=project2,
        role=role1
    )
    models.UserProject.objects.create(
        user=user10,
        project=project3,
        role=role2
    )
    models.UserProject.objects.create(
        user=user5,
        project=project3,
        role=role1
    )
    models.UserProject.objects.create(
        user=user6,
        project=project3,
        role=role2
    )
    models.UserProject.objects.create(
        user=user7,
        project=project4,
        role=role1
    )
    models.UserProject.objects.create(
        user=user8,
        project=project4,
        role=role2
    )
    models.CrorisInstitutions.objects.create(
        active=True,
        name_short="Fakultet elektrotehnike i računarstva",
        oib="01234567890",
        mbu="036"
    )
    models.CrorisInstitutions.objects.create(
        active=True,
        name_short="Prirodoslovno-matematički fakultet, Zagreb",
        oib="12345678901",
        mbu="119"
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
            "gpuh": 0.1181
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
            "gpuh": 0.2178
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
            "gpuh": 0
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
            "gpuh": 0
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
            "gpuh": 0
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
            "gpuh": 1.3711
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
            "gpuh": 0
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
            "gpuh": 0.1367
        }
    )
