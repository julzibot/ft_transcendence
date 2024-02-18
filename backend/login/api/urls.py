from django.urls import path

from login.api.views import api_detail_login_view

app_name = 'login'

urlpatterns = [
  path('', api_detail_login_view, name="username-details")
]