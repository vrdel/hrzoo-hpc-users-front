from django.conf import settings
from django.core.mail import send_mail


def email_new_project(to, name, lead, link):

    email = \
f"""
Poštovani,


prijavljen je novi projekt pri usluzi Napredno računanje.

Naziv: {name}

Voditelj: {lead.first_name} {lead.last_name}

Pogledaj prijavu: https://computing.srce.hr/ui/upravljanje-zahtjevima/{link}


{settings.EMAILSIGNATURE}
"""

    return send_mail(
        'Prijava novog projekta',
        email,
        settings.EMAILFROM, to,
        fail_silently=False)
