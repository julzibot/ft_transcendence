from django.urls import path
from dashboard.views import DashboardView
from .views import SigninView, UpdateNameView, RegisterView, SearchUserView, UpdateImageView, UpdatePasswordView, DeleteAccountView, SignOutView, GetUserView, GetSCRFTokenView, LogoutView, GetUserInfosView

urlpatterns = [
  path('auth/register/', RegisterView.as_view(), name='register'),
  path('auth/signin/', SigninView.as_view()),
  path('auth/logout/', LogoutView.as_view()),
  path('auth/user/', GetUserView.as_view()),
  path('auth/user/delete/', DeleteAccountView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
  path('update/image/', UpdateImageView.as_view()),
  path('update/password/', UpdatePasswordView.as_view()),
  path('search-user/', SearchUserView.as_view()),
  path('auth/signout/', SignOutView.as_view()),
  path('user/get-user-info/', GetUserInfosView.as_view()),
  path('csrf-cookie/', GetSCRFTokenView.as_view()),
]