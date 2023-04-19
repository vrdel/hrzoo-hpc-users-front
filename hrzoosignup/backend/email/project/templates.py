from django.conf import settings
from django.core.mail import send_mail


def email_approve_project(to, name, prtype):
    project_type_subject = ''
    if prtype.name == 'thesis':
        project_type_subject = "Završni rad/disertacija odobrena"
    elif prtype.name == 'practical':
        project_type_subject = "Praktična nastava odobrena"
    elif prtype.name == 'research-croris':
        project_type_subject = "Istraživački projekt odobren"

    email = \
f"""\
Poštovani/a,

vaša je prijava projekta "{name}" pri usluzi Napredno računanje prihvaćena.

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        project_type_subject,
        email,
        settings.EMAILFROM, to,
        fail_silently=True)


def email_deny_project(to, name, prtype):
    project_type_subject = ''
    if prtype.name == 'thesis':
        project_type_subject = "Završni rad/disertacija odobrena"
    elif prtype.name == 'practical':
        project_type_subject = "Praktična nastava nije prihvaćen"
    elif prtype.name == 'research-croris':
        project_type_subject = "Istraživački projekt nije prihvaćen"

    email = \
f"""\
Poštovani/a,

vaša je prijava zahtjeva "{name}" pri usluzi Napredno računanje odbačena, s obrazloženjem:



{settings.EMAILSIGNATURE}
"""

    return send_mail(
        project_type_subject,
        email,
        settings.EMAILFROM, to,
        fail_silently=True)


def email_new_project(to, name, lead, prtype, link):
    project_type_subject = ''
    if prtype.name == 'thesis':
        project_type_subject = "novog završnog rada/disertacije"
    elif prtype.name == 'practical':
        project_type_subject = "nove praktične nastave"
    elif prtype.name == 'research-croris':
        project_type_subject = "novog istraživačkog projekta"

    email = \
f"""\
Poštovani/a,

prijavljen je novi projekt pri usluzi Napredno računanje.

Naziv: {name}

Voditelj: {lead.first_name} {lead.last_name}

Pogledaj prijavu: https://computing.srce.hr/ui/upravljanje-zahtjevima/{link}

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        'Prijava {}'.format(project_type_subject),
        email,
        settings.EMAILFROM, to,
        fail_silently=True)
