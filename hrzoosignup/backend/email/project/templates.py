from django.conf import settings
from django.core.mail import send_mail


def email_approve_project(to, name, prtype):
    subject = '[Napredno računanje] Zahtjev odobren'

    email = \
f"""\
Poštovani/a,

vaš zahtjev za korištenje usluge Napredno računanje "{name}" je prihvaćen.

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        subject,
        email,
        settings.EMAILFROM, to,
        fail_silently=True)


def email_deny_project(to, name, prtype, comment):
    project_type_subject = '[Napredno računanje] Zahtjev nije odobren'

    email = \
f"""\
Poštovani/a,

vaš zahtjev za korištenje usluge Napredno računanje "{name}" je odbačen
s obrazloženjem:

{comment}

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        project_type_subject,
        email,
        settings.EMAILFROM, to,
        fail_silently=True)


def email_new_project(to, name, lead, prtype, prident):
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

prijavljen je novi projekt na usluzi Napredno računanje.

Naziv: {name}

Voditelj: {lead.first_name} {lead.last_name}

Pogledaj prijavu: https://computing.srce.hr/ui/upravljanje-zahtjevima/{prident}

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        '[Napredno računanje] Prijava {}'.format(project_type_subject),
        email,
        settings.EMAILFROM, to,
        fail_silently=True)
