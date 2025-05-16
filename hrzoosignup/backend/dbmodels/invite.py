from invitations.adapters import get_invitations_adapter
from invitations.app_settings import app_settings
from invitations.base_invitation import AbstractBaseInvitation
from invitations import signals

from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.utils.crypto import get_random_string

import datetime

from .project import Project

try:
    from django.urls import reverse
except ImportError:
    from django.core.urlresolvers import reverse


def is_foreign_invite(target_email, request):
    frg_collabs = request.data.get('foreignCollaboratorEmails')

    if frg_collabs:
        emails = set([collab['value'] for collab in frg_collabs])
        if target_email in emails:
            return True

    return False


# picked from invitations.model and overriden it as I didn't like
# uniqueness on email as we'll need to send multiple project invitations
# on the same email. also added relation to project.
# -vrdel
class CustomInvitation(AbstractBaseInvitation):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    email = models.EmailField(
        verbose_name=_("e-mail address"),
        max_length=254,
    )
    created = models.DateTimeField(verbose_name=_("created"), default=timezone.now)
    person_oib = models.CharField(_('OIB number'), max_length=11, blank=True,)
    invtype = models.CharField(_('Invitation type'), max_length=16, blank=True)

    class Meta:
        unique_together = ['project', 'email']

    @classmethod
    def create(cls, email, inviter=None, **kwargs):
        key = get_random_string(64).lower()
        instance = cls._default_manager.create(
            email=email, key=key, inviter=inviter, **kwargs
        )
        return instance

    def key_expired(self):
        expiration_date = self.sent + datetime.timedelta(
            days=app_settings.INVITATION_EXPIRY,
        )
        return expiration_date <= timezone.now()

    def send_invitation(self, request, **kwargs):
        current_site = get_current_site(request)
        invite_url = reverse(app_settings.CONFIRMATION_URL_NAME, args=[self.key])
        invite_url = request.build_absolute_uri(invite_url)

        invite_foreigner = is_foreign_invite(self.email, request)
        if invite_foreigner:
            self.invtype = 'foreign'
        else:
            self.invtype = 'local'

        ctx = kwargs
        ctx.update(
            {
                "invite_url": '{}://{}/ui/login-email/{}'.format(
                    request.scheme,
                    request.get_host(),
                    self.key
                ),
                "site_name": current_site.name,
                "project_name": self.project.name,
                "email": self.email,
                "key": self.key,
                "inviter": self.inviter,
                "first_name": self.inviter.first_name,
                "last_name": self.inviter.last_name,
            },
        )

        if invite_foreigner:
            email_template = "invitations/email/email_invite_en"
            settings.DEFAULT_FROM_EMAIL = 'Advanced Computing <computing@srce.hr>'
        else:
            email_template = "invitations/email/email_invite"
            settings.DEFAULT_FROM_EMAIL = 'Napredno računanje <computing@srce.hr>'

        get_invitations_adapter().send_mail(email_template, self.email, ctx)
        self.sent = timezone.now()
        self.save()

        signals.invite_url_sent.send(
            sender=self.__class__,
            instance=self,
            invite_url_sent=invite_url,
            inviter=self.inviter,
        )

    def __str__(self):
        return f"Invite: {self.email}"
