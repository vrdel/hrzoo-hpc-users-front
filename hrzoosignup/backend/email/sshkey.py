from django.conf import settings

from backend.email.loader import render_and_send


def email_add_sshkey(user):
    return render_and_send(
        settings.EMAIL_TEMPLATE_ADD_SSHKEY,
        {
            'user_first_name': user.first_name,
            'user_last_name': user.last_name,
            'username': user.username,
            'signature': settings.EMAILSIGNATURE,
        },
        from_addr=settings.EMAILFROM,
        to=settings.EMAILUS,
    )
