from django.urls import path
from .views import SigninView, UserView, UpdateNameView, SignupView, CustomTokenRefreshView

urlpatterns = [
  path('signin/', SigninView.as_view()),
  path('signup/', SignupView.as_view()),
  path('user/', UserView.as_view()),
  path('refresh/', CustomTokenRefreshView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
]