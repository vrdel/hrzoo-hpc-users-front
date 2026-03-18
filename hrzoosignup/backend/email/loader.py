from string import Template

from django.core.mail import EmailMessage


def load_email_template(template_path):
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()

    subject_line, _, body = content.partition('\n\n')
    return Template(subject_line), Template(body)


def render_and_send(template_path, variables, from_addr, to=None, bcc=None):
    subject_tmpl, body_tmpl = load_email_template(template_path)
    subject = subject_tmpl.substitute(variables)
    body = body_tmpl.substitute(variables)

    em = EmailMessage(
        subject=subject,
        body=body,
        from_email=from_addr,
        to=to or [],
        bcc=bcc
    )
    return em.send(fail_silently=True)
