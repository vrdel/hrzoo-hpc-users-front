from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views import View


def custom_acs_failure(request, exception=None, status=403, **kwargs):
    if request.path.startswith('/saml2/edugain/acs'):
        return HttpResponseRedirect('/ui/saml2-not-allowed')
    else:
        return render(request, 'djangosaml2/login_error.html', {'exception': exception}, status=status)
