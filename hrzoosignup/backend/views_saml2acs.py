from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views import View
from djangosaml2.views import AssertionConsumerServiceView


class CustomSaml2Acs(AssertionConsumerServiceView):
    def post_login_hook(self, request, user, session_info):
        request.session['saml2_idp'] = session_info['issuer']
        super().post_login_hook(request, user, session_info)


def custom_acs_failure(request, exception=None, status=403, **kwargs):
    if request.path.startswith('/saml2/edugain/acs'):
        failed_authn_multiresults = getattr(request, 'saml2_backend_multiple', None)
        if failed_authn_multiresults:
            return HttpResponseRedirect('/ui/saml2-not-allowed/multiple')
        else:
            return HttpResponseRedirect('/ui/saml2-not-allowed')
    else:
        return render(request, 'djangosaml2/login_error.html', {'exception': exception}, status=status)
