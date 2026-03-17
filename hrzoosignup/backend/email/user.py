from django.conf import settings

from backend.email.loader import render_and_send


def email_approve_membership(to, name, collab):
    return render_and_send(
        settings.EMAIL_TEMPLATE_APPROVE_MEMBERSHIP,
        {
            'collab_first_name': collab.first_name,
            'collab_last_name': collab.last_name,
            'name': name,
            'signature': settings.EMAILSIGNATURE,
        },
        from_addr=settings.EMAILFROM,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_approve_membership_en(to, name, collab):
    return render_and_send(
        settings.EMAIL_TEMPLATE_APPROVE_MEMBERSHIP_EN,
        {
            'collab_first_name': collab.first_name,
            'collab_last_name': collab.last_name,
            'name': name,
            'signature': settings.EMAILSIGNATUREEN,
        },
        from_addr=settings.EMAILFROMEN,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_signoff_membership(to, project_name):
    return render_and_send(
        settings.EMAIL_TEMPLATE_SIGNOFF_MEMBERSHIP,
        {
            'project_name': project_name,
            'signature': settings.EMAILSIGNATURE,
        },
        from_addr=settings.EMAILFROM,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_signoff_membership_en(to, project_name):
    return render_and_send(
        settings.EMAIL_TEMPLATE_SIGNOFF_MEMBERSHIP_EN,
        {
            'project_name': project_name,
            'signature': settings.EMAILSIGNATUREEN,
        },
        from_addr=settings.EMAILFROMEN,
        to=[to],
        bcc=settings.EMAILUS,
    )
