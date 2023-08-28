from django.urls import path
from rest_framework import routers

from . import views

app_name = 'backend'

router = routers.DefaultRouter()

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
    path("users", views.UsersAPI.as_view(), name="users"),
    path("projects", views.ProjectsAPI.as_view(), name="projects"),
    path("userproject", views.UserProjectAPI.as_view(), name="userproject"),
    path("sshkeys", views.SshKeysAPI.as_view(), name="sshkeys"),
] + router.urls
