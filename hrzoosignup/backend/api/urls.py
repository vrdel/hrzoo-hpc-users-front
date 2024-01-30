from django.urls import path
from rest_framework import routers

from . import views

app_name = 'backend'

router = routers.DefaultRouter()

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
    path("usersprojects", views.UserProjectAPI.as_view(), name="usersprojects"),
    path("sshkeys", views.SshKeysAPI.as_view(), name="sshkeys"),
    path("accounting/projectsusers", views.AccountingUserProjectAPI.as_view(), name="accountingprojectsusers"),
] + router.urls
