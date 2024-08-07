from django.urls import path
from dashboard.views import DashboardView
from .views import SigninView, UserView, UpdateNameView, RegisterView, CustomTokenRefreshView, SearchUserView, AccessTokenView, OauthView, UpdateImageView, UpdatePasswordView, DeleteAccountView, SignOutView

urlpatterns = [
  path('auth/signin/', SigninView.as_view()),
  path('auth/register/', RegisterView.as_view()),
  path('auth/oauth/', OauthView.as_view()),
  path('auth/access_token/', AccessTokenView.as_view()),
  path('auth/user/', UserView.as_view()),
  path('auth/user/delete/', DeleteAccountView.as_view()),
  path('refresh/', CustomTokenRefreshView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
  path('update/image/', UpdateImageView.as_view()),
  path('update/password/', UpdatePasswordView.as_view()),
  path('search-user/', SearchUserView.as_view()),
  path('auth/signout/', SignOutView.as_view())
]