from django.conf import settings
from django.core.mail import send_mail


def email_approve_membership(to, name, collab):

    subject = "[Napredno računanje] Prijava korisnika uspješna"

f"""\
Poštovani/a,

suradnik {collab.first_name} {collab.last_name} je potvrdio prijavu na projekt
"{name}".

{settings.EMAILSIGNATURE}
"""

    return send_mail(
        project_type_subject,
        email,
        settings.EMAILFROM, to,
        fail_silently=True)
