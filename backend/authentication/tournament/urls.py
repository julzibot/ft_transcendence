from django.urls import path
from .views import TournamentView, TournamentDetailView


urlpatterns = [
  path('', TournamentView.as_view(), name='tournament'),
  path('<int:id>', TournamentDetailView.as_view(), name='tournament-detail'),
]