from rest_framework import routers
from django.urls import include, path, re_path
from . import viewsets
from . import views

app_name = 'backend'

router = routers.DefaultRouter()

urlpatterns = [
    path('croris-info/', views.CroRISInfo.as_view(), name='crorisinfo'),
    path('projects/', views.Projects.as_view(), name='projects'),
    path('projects/role/<str:targetrole>', views.ProjectsRole.as_view(), name='projectsrole'),
    path('projects/<str:specific>', views.Projects.as_view(), name='projects'),
    path('projects-research/', views.ProjectsResearch.as_view(), name='projectsresearch'),
    path('projects-general/', views.ProjectsGeneral.as_view(), name='projectsgeneral'),
    path('invites/', views.Invites.as_view(), name='invites'),
    path('invites-sent/', views.InvitesSent.as_view(), name='invitessent'),
    path('invites/<str:invitekey>', views.Invites.as_view(), name='invites'),
    path('invites-userlink/', views.InvitesLink.as_view(), name='inviteslink'),
    path('keys/', views.SshKeys.as_view(), name='sshkeys'),
    path('keys/<str:all>', views.SshKeys.as_view(), name='sshkeys'),
] + router.urls
