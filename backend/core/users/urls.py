from django.urls import path
from dashboard.views import DashboardView
from .views import SigninView, UserView, UpdateNameView, RegisterView, CustomTokenRefreshView, SearchUserView, UpdateImageView, UpdatePasswordView, DeleteAccountView, SignOutView, GetUserView, GetSCRFTokenView, LogoutView, SessionView, CheckAuthenticatedView

urlpatterns = [
  path('auth/register/', RegisterView.as_view(), name='register'),
  path('auth/signin/', SigninView.as_view()),
  path('auth/is-authenticated/', CheckAuthenticatedView.as_view()),
  path('auth/session/', SessionView.as_view()),
  path('auth/logout/', LogoutView.as_view()),
  path('auth/user/', UserView.as_view()),
  path('auth/user/delete/', DeleteAccountView.as_view()),
  path('refresh/', CustomTokenRefreshView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
  path('update/image/', UpdateImageView.as_view()),
  path('update/password/', UpdatePasswordView.as_view()),
  path('search-user/', SearchUserView.as_view()),
  path('auth/signout/', SignOutView.as_view()),
  path('user/get-user-info/', GetUserView.as_view()),
  path('csrf-cookie/', GetSCRFTokenView.as_view()),
]