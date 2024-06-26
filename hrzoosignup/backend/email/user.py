from django.conf import settings
from django.core.mail import EmailMessage


def email_approve_membership(to, name, collab):
    subject = "Prijava korisnika uspješna"

    body = \
f"""\
Poštovani/a,

suradnik {collab.first_name} {collab.last_name} je potvrdio prijavu na projekt
"{name}".

{settings.EMAILSIGNATURE}
"""

    em = EmailMessage(\
        subject,
        body,
        settings.EMAILFROM,
        [to],
        [settings.EMAILUS]
    )

    return em.send(fail_silently=True)


def email_approve_membership_en(to, name, collab):
    subject = "User Registration Successful"

    body = \
f"""\
Dear,

The collaborator {collab.first_name} {collab.last_name} has confirmed registration for the project
"{name}".

{settings.EMAILSIGNATUREEN}
"""

    em = EmailMessage(\
        subject,
        body,
        settings.EMAILFROMEN,
        [to],
        [settings.EMAILUS]
    )

    return em.send(fail_silently=True)
