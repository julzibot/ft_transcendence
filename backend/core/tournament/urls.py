from django.urls import path
from .views import TournamentCreateView, TournamentListView, JoinTournamentView, TournamentView, DeleteParticipantView, StartTournamentView, EndTournamentView, DeleteTournamentView


urlpatterns = [
  path('create/', TournamentCreateView.as_view(), name='tournament-create'),
  path('', TournamentListView.as_view(), name='tournament-list'),
  path('join/', JoinTournamentView.as_view(), name='tournament-join'),
  path('<str:id>/', TournamentView.as_view(), name='tournament'),
  path('<str:id>/start/', StartTournamentView.as_view(), name="start" ),
  path('<str:id>/end/', EndTournamentView.as_view(), name="start" ),
  path('<str:id>/delete-participant/', DeleteParticipantView.as_view(), name='delete-participant'),
  path('<str:id>/start/', StartTournamentView.as_view(), name="start" ),
  path('<str:id>/delete/', DeleteTournamentView.as_view(), name="delete"),
]