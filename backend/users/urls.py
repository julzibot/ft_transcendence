from django.urls import path
from .views import SigninView, UserView, UpdateNameView

urlpatterns = [
  path('signin/', SigninView.as_view()),
  path('user/', UserView.as_view()),
  path('update/name/', UpdateNameView.as_view()),
]