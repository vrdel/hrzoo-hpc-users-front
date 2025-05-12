import datetime

import pytz
from backend import models
from django.utils import timezone


def create_mock_db():
    models.Organization4APIKey.objects.create(name="hrzoo")
    models.Organization4APIKey.objects.create(name="merlin")
    type1 = models.ProjectType.objects.create(name="research-croris")
    type2 = models.ProjectType.objects.create(name="thesis")
    type3 = models.ProjectType.objects.create(name="practical")
    type4 = models.ProjectType.objects.create(name="research-institutional")
    models.ProjectType.objects.create(name="internal")
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
        project_type=type1,
        croris_id=123456,
        resources_type=[
            {"label": "CLOUD-GPU", "value": "CLOUD-GPU"},
            {"label": "CLOUD", "value": "CLOUD"},
            {"label": "GPU", "value": "GPU"},
            {"label": "CPU", "value": "CPU"},
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "CLOUD-GPU", "value": "CLOUD-GPU"},
            {"label": "CLOUD", "value": "CLOUD"},
            {"label": "GPU", "value": "GPU"},
            {"label": "CPU", "value": "CPU"},
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        science_field=[
            {
                'name': {
                    'label': 'PRIRODNE ZNANOSTI', 'value': 'PRIRODNE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Fizika', 'value': 'Fizika'},
                    'percent': 100}]
            }
        ],
        croris_finance=[{
            "name": 'Hrvatska zaklada za znanost',
            "amount": "100",
            "currency": "EUR"
        }],
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
        project_type=type4,
        science_field=[
            {
                'name': {
                    'label': 'TEHNIČKE ZNANOSTI', 'value': 'TEHNIČKE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Računarstvo', 'value': 'Računarstvo'},
                    'percent': 100
                }]
            }
        ],
        resources_type=[
            {"label": "CPU", "value": "CPU"},
            {"label": "GPU", "value": "GPU"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "CPU", "value": "CPU"},
            {"label": "GPU", "value": "GPU"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
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
        project_type=type2,
        resources_type=[
            {"label": "CLOUD-GPU", "value": "CLOUD-GPU"},
            {"label": "CLOUD-CPU", "value": "CLOUD-CPU"},
            {"label": "GPU", "value": "GPU"},
            {"label": "CPU", "value": "CPU"},
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "GPU", "value": "GPU"},
            {"label": "CPU", "value": "CPU"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        science_field=[
            {
                'name': {
                    'label': 'TEHNIČKE ZNANOSTI', 'value': 'TEHNIČKE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Računarstvo', 'value': 'Računarstvo'},
                    'percent': 100
                }]
            }
        ],
        date_start=datetime.date(2024, 3, 1),
        date_end=datetime.date(2025, 5, 1),
        date_approved=datetime.datetime(2024, 3, 7, 14, 58, 13, tzinfo=pytz.UTC)
    )
    project4 = models.Project.objects.create(
        identifier="project-4",
        name="Project name 4",
        institute="Prirodoslovno-matematički fakultet, Zagreb",
        science_extrasoftware_help=False,
        project_type=type1,
        is_active=True,
        croris_id=666,
        croris_finance=[{
            "name": 'Trotters Independent Traders',
            "amount": "10",
            "currency": "GBP"
        }],
        state=state5,
        resources_type=[
            {"label": "CLOUD-GPU", "value": "CLOUD-GPU"},
            {"label": "CLOUD-CPU", "value": "CLOUD-CPU"},
            {"label": "GPU", "value": "GPU"},
            {"label": "CPU", "value": "CPU"},
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "CLOUD-GPU", "value": "CLOUD-GPU"},
            {"label": "CLOUD-CPU", "value": "CLOUD-CPU"},
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        science_field=[
            {
                'name': {
                    'label': 'PRIRODNE ZNANOSTI', 'value': 'PRIRODNE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Biologija', 'value': 'Biologija'},
                    'percent': 100}]
            }
        ],
        date_start=datetime.date(2024, 1, 1),
        date_end=datetime.date(2024, 6, 30),
        bogus_end=datetime.date(2024, 12, 31),
        date_approved=datetime.datetime(2024, 2, 2, 15, 8, 28, tzinfo=pytz.UTC)
    )
    project5 = models.Project.objects.create(
        identifier="project-5",
        name="Project name 5",
        institute="Fakultet elektrotehnike i računarstva",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        project_type=type3,
        resources_type=[
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        science_field=[
            {
                'name': {
                    'label': 'TEHNIČKE ZNANOSTI', 'value': 'TEHNIČKE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Računarstvo', 'value': 'Računarstvo'},
                    'percent': 100
                }]
            }
        ],
        date_start=datetime.date(2024, 5, 1),
        date_end=datetime.date(2025, 12, 31),
        date_approved=datetime.datetime(2024, 5, 3, 12, 0, 13, tzinfo=pytz.UTC)
    )
    project6 = models.Project.objects.create(
        identifier="Grant agreement ID: 123456",
        name="Project name 6",
        institute="Fakultet elektrotehnike i računarstva",
        science_extrasoftware_help=False,
        is_active=True,
        state=state1,
        project_type=type3,
        resources_type=[
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        staff_resources_type=[
            {"label": "PADOBRAN", "value": "PADOBRAN"},
            {"label": "JUPYTER", "value": "JUPYTER"}
        ],
        science_field=[
            {
                'name': {
                    'label': 'TEHNIČKE ZNANOSTI', 'value': 'TEHNIČKE ZNANOSTI'
                },
                'percent': 100,
                'scientificfields': [{
                    'name': {'label': 'Računarstvo', 'value': 'Računarstvo'},
                    'percent': 100
                }]
            }
        ],
        date_start=datetime.date(2024, 5, 1),
        date_end=datetime.date(2025, 12, 31),
        date_approved=datetime.datetime(2024, 5, 4, 12, 0, 13, tzinfo=pytz.UTC)
    )
    user1 = models.User.objects.create_user(
        username="user119@fer.hr",
        person_uniqueid="user119@fer.hr",
        croris_first_name="Arthur",
        croris_last_name="Dent",
        first_name="Arthur",
        last_name="Dent",
        person_oib="11111111111",
        person_username="adent",
        person_mail="arthur.dent@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user2 = models.User.objects.create_user(
        username="user454@fer.hr",
        person_uniqueid="user454@fer.hr",
        person_oib="22222222222",
        croris_first_name="Tricia",
        croris_last_name="McMillan",
        first_name="Tricia",
        last_name="McMillan",
        person_username="tmcmilla",
        person_mail="trillian@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user3 = models.User.objects.create_user(
        username="user45@fer.hr",
        person_uniqueid="user45@fer.hr",
        person_oib="33333333333",
        croris_first_name="Ford",
        croris_last_name="Prefect",
        first_name="Ford",
        last_name="Prefect",
        person_username="fprefect",
        person_mail="ford.prefect@fer.hr",
        person_institution="Fakultet elektrotehnike i računarstva",
        status=True,
        mailinglist_subscribe=True
    )
    user4 = models.User.objects.create_user(
        username="user70@fer.hr",
        person_uniqueid="user70@fer.hr",
        person_oib="44444444444",
        croris_first_name="Zaphod",
        croris_last_name="Beeblebrox",
        first_name="Zaphod",
        last_name="Beeblebrox",
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
        first_name="Marvin",
        last_name="The Paranoid Android",
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
        person_oib="77777777777",
        croris_first_name="Derek",
        croris_last_name="Trotter",
        first_name="Derek",
        last_name="Trotter",
        person_username="dtrotter",
        person_mail="delboy@biol.pmf.hr",
        person_institution="Prirodoslovno-matematički fakultet, Zagreb",
        status=True,
        mailinglist_subscribe=True
    )
    user8 = models.User.objects.create_user(
        username="dave@pmf.hr",
        person_uniqueid="dave@pmf.hr",
        person_oib="88888888888",
        croris_first_name="Rodney",
        croris_last_name="Trotter",
        first_name="Rodney",
        last_name="Trotter",
        person_username="rtrotter",
        person_mail="dave@biol.pmf.hr",
        person_institution="Prirodoslovno-matematički fakultet, Zagreb",
        status=True,
        mailinglist_subscribe=True
    )
    user9 = models.User.objects.create_user(
        username="uncle_albert@pmf.hr",
        person_uniqueid="uncle_albert@pmf.hr",
        person_oib="99999999999",
        croris_first_name="Albert",
        croris_last_name="Trotter",
        first_name="Albert",
        last_name="Trotter",
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
        role=role1,
        date_joined=datetime.datetime(2023, 5, 3, 0, 0, 0, tzinfo=pytz.UTC)
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
    project1.users.add(user1, user2, user9)
    models.UserProject.objects.create(
        user=user1,
        project=project2,
        role=role2,
        date_joined=datetime.datetime(2024, 6, 10, 12, 0, 13, tzinfo=pytz.UTC)
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
    project2.users.add(user1, user3, user4)
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
    project3.users.add(user10, user5, user6)
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
    project4.users.add(user7, user8)
    models.UserProject.objects.create(
        user=user2,
        project=project5,
        role=role1
    )
    models.UserProject.objects.create(
        user=user1,
        project=project5,
        role=role2
    )
    project5.users.add(user2, user1)
    models.UserProject.objects.create(
        user=user1,
        project=project6,
        role=role1
    )
    project6.users.add(user1)
    models.CrorisInstitutions.objects.create(
        active=True,
        name_short="Fakultet elektrotehnike i računarstva",
        name_long="Sveučilište u Zagrebu, Fakultet elektrotehnike i "
                  "računarstva",
        oib="01234567890",
        mbu="036",
        parent="Sveučilište u Zagrebu"
    )
    models.CrorisInstitutions.objects.create(
        active=True,
        name_short="Prirodoslovno-matematički fakultet, Zagreb",
        oib="12345678901",
        mbu="119",
        parent="Sveučilište u Zagrebu"
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
            "cpuh": 5,
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
        project=project5,
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
    models.ResourceUsage.objects.create(
        user=user2,
        project=project5,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1723976396),  # 18 Aug 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 0.73,
            "jupyter_gpu_h": 0.18
        }
    )
    models.ResourceUsage.objects.create(
        user=user2,
        project=project5,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1721557976),  # 21 Jul 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 2.34,
            "jupyter_gpu_h": 0
        }
    )
    models.ResourceUsage.objects.create(
        user=user2,
        project=project5,
        resource_name="jupyter",
        end_time=timezone.make_aware(
            datetime.datetime.fromtimestamp(1721756893),  # 23 Jul 2024
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "jupyter_cpu_h": 2.83,
            "jupyter_gpu_h": 3.43
        }
    )
    models.ResourceUsage.objects.create(
        project=project1,
        resource_name="cloud",
        end_time=timezone.make_aware(
            datetime.datetime(2024, 6, 18, 23, 59, 59),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "cpuh": 575.9867,
            "gpuh": 0.0,
            "ngpus": None,
            "vcpus": 24,
            "flavor": "m1.xlarge.windows",
            "ended_at": None,
            "start_time": 1718661600.0,
            "started_at": 1718533146.0,
            "instance_id": "123432451-14322143-13412"
        }
    )
    models.ResourceUsage.objects.create(
        project=project1,
        resource_name="cloud",
        end_time=timezone.make_aware(
            datetime.datetime(2024, 6, 19, 18, 43, 17),
            timezone=timezone.get_current_timezone()
        ),
        accounting_record={
            "cpuh": 449.3133,
            "gpuh": 0.0,
            "ngpus": None,
            "vcpus": 24,
            "flavor": "m1.xlarge.windows",
            "ended_at": 1718815397.0,
            "start_time": 1718748000.0,
            "started_at": 1718533146.0,
            "instance_id": "123432451-14322143-13412"
        }
    )
