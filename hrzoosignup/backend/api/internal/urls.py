from rest_framework import routers
from django.urls import include, path, re_path
from . import viewsets
from . import views

app_name = 'backend'

router = routers.DefaultRouter()

urlpatterns = [
    path('croris-info/', views.CroRISInfo.as_view(), name='crorisinfo'),
    path('keys/', views.SshKeys.as_view(), name='sshkeys'),
] + router.urls
