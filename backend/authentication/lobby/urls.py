from django.urls import path
from .views import LobbyView


urlpatterns = [
  path('', LobbyView.as_view(), name='lobby'),
]