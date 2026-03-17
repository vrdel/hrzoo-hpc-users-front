from django.conf import settings

from backend.email.loader import render_and_send


PROJECT_TYPE_MAP = {
    'thesis': "nove izrade rada",
    'practical': "nove praktične nastave",
    'research-croris': "novog istraživačkog projekta",
    'research-institutional': "novog institucijskog projekta",
    'internal': "novog internog projekta",
    'srce-workshop': "nove Srce radionice",
}


def email_approve_project(to, name, prtype):
    return render_and_send(
        settings.EMAIL_TEMPLATE_APPROVE_PROJECT,
        {'name': name, 'signature': settings.EMAILSIGNATURE},
        from_addr=settings.EMAILFROM,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_deny_project(to, name, prtype, comment):
    return render_and_send(
        settings.EMAIL_TEMPLATE_DENY_PROJECT,
        {'name': name, 'comment': comment, 'signature': settings.EMAILSIGNATURE},
        from_addr=settings.EMAILFROM,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_new_project(name, lead, prtype, prident):
    project_type_label = PROJECT_TYPE_MAP.get(prtype.name, '')
    return render_and_send(
        settings.EMAIL_TEMPLATE_NEW_PROJECT,
        {
            'name': name,
            'lead_first_name': lead.first_name,
            'lead_last_name': lead.last_name,
            'prident': prident,
            'project_type_label': project_type_label,
            'signature': settings.EMAILSIGNATURE,
        },
        from_addr=settings.EMAILFROM,
        to=settings.EMAILUS,
    )


def email_approve_project_en(to, name, prtype):
    return render_and_send(
        settings.EMAIL_TEMPLATE_APPROVE_PROJECT_EN,
        {'name': name, 'signature': settings.EMAILSIGNATUREEN},
        from_addr=settings.EMAILFROMEN,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_deny_project_en(to, name, prtype, comment):
    return render_and_send(
        settings.EMAIL_TEMPLATE_DENY_PROJECT_EN,
        {'name': name, 'comment': comment, 'signature': settings.EMAILSIGNATUREEN},
        from_addr=settings.EMAILFROMEN,
        to=[to],
        bcc=settings.EMAILUS,
    )


def email_auto_approve_project(name):
    return render_and_send(
        settings.EMAIL_TEMPLATE_AUTO_APPROVE_PROJECT,
        {'name': name, 'signature': settings.EMAILSIGNATURE},
        from_addr=settings.EMAILFROM,
        to=settings.EMAILUS,
    )
