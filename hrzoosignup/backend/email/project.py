from django.conf import settings
from django.core.mail import EmailMessage


def email_approve_project(to, name, prtype):
    subject = '[Napredno računanje] Zahtjev odobren'

    body = \
f"""\
Poštovani/a,

vaš zahtjev za korištenje usluge Napredno računanje "{name}" je prihvaćen.

{settings.EMAILSIGNATURE}
"""

    em = EmailMessage(\
        subject,
        body,
        settings.EMAILFROM,
        [to],
        [settings.EMAILUS])

    return em.send(fail_silently=True)


def email_deny_project(to, name, prtype, comment):
    project_type_subject = '[Napredno računanje] Zahtjev nije odobren'

    body = \
f"""\
Poštovani/a,

vaš zahtjev za korištenje usluge Napredno računanje "{name}" je odbačen
s obrazloženjem:

{comment}

{settings.EMAILSIGNATURE}
"""

    em = EmailMessage(\
        project_type_subject,
        body,
        settings.EMAILFROM,
        [to],
        [settings.EMAILUS])

    return em.send(fail_silently=True)


def email_new_project(name, lead, prtype, prident):
    project_type_subject = ''
    if prtype.name == 'thesis':
        project_type_subject = "nove izrade rada"
    elif prtype.name == 'practical':
        project_type_subject = "nove praktične nastave"
    elif prtype.name == 'research-croris':
        project_type_subject = "novog istraživačkog projekta"
    elif prtype.name == 'research-institutional':
        project_type_subject = "novog institucijskog projekta"
    elif prtype.name == 'internal':
        project_type_subject = "novog internog projekta"
    elif prtype.name == 'srce-workshop':
        project_type_subject = "nove Srce radionice"

    body = \
f"""\
Poštovani/a,

prijavljen je novi projekt na usluzi Napredno računanje.

Naziv: {name}

Voditelj: {lead.first_name} {lead.last_name}

Pogledaj prijavu: https://computing.srce.hr/ui/zahtjevi/{prident}

{settings.EMAILSIGNATURE}
"""

    em = EmailMessage(\
        '[Napredno računanje] Prijava ' + project_type_subject,
        body,
        settings.EMAILFROM,
        [settings.EMAILUS])

    return em.send(fail_silently=True)
