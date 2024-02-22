from django.urls import path
from .views import LoginView, UserView, RefreshView

urlpatterns = [
  path('login/', LoginView.as_view()),
  path('user/', UserView.as_view()),
  path('refresh/', RefreshView.as_view()),
]