from django.urls import path
from dashboard.views import DashboardView
from .views import SigninView, UserView, UpdateNameView, SignupView, CustomTokenRefreshView, SearchUserView, AccessTokenView

urlpatterns = [
  path('auth/signin/', SigninView.as_view()),
  path('signup/', SignupView.as_view()),
  path('auth/access_token/', AccessTokenView.as_view()),
  path('auth/user/', UserView.as_view()),
  path('refresh/', CustomTokenRefreshView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
  path('search-user/', SearchUserView.as_view()),
]