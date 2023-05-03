from django.urls import path
from rest_framework import routers

from . import views

app_name = 'backend'

router = routers.DefaultRouter()

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
    path("active_users", views.UsersAPI.as_view(), name="users"),
] + router.urls
