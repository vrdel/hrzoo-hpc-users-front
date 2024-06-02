from django.conf import settings
from django.core.mail import EmailMessage


def email_add_sshkey(user):
    subject = "Dodan novi javni ključ"

    body = \
f"""\
Poštovani/a,

korisnik {user.first_name} {user.last_name}, {user.username} je dodao novi SSH javni ključ.

{settings.EMAILSIGNATURE}
"""

    em = EmailMessage(\
        subject,
        body,
        settings.EMAILFROM,
        [settings.EMAILUS]
    )

    return em.send(fail_silently=True)
