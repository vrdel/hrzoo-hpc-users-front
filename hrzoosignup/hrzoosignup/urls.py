"""hrzoosignup URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect

from backend.views_saml2acs import CustomSaml2Acs


urlpatterns = [
    re_path(r'^$', lambda x: HttpResponseRedirect('/ui/login')),
    path('auth/', include('dj_rest_auth.urls')),
    path('saml2/acs/', CustomSaml2Acs.as_view(), name='saml2_customacs'),
    re_path(r'^saml2/', include(('djangosaml2.urls', 'backend'), namespace='saml2')),
    path('saml2/edugain/acs/', CustomSaml2Acs.as_view(), name='saml2_customacs'),
    re_path(r'^saml2/edugain/', include(('djangosaml2.urls', 'backend'), namespace='saml2_edugain')),
    re_path(r'^ui', TemplateView.as_view(template_name='index.html')),
    re_path(r'^api/v1/internal/', include('backend.api.internal.urls', namespace='internalapi')),
    path("invitations/", include('invitations.urls', namespace='invitations')),
    re_path(r'^api/v1/', include('backend.api.urls', namespace='api')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
