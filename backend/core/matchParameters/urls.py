from django.urls import path
from .views import MatchParametersView, UpdateMatchParametersView

urlpatterns = [
	path('', UpdateMatchParametersView.as_view(), name='update-match-parameters'),
	path('<int:id>', MatchParametersView.as_view(), name='match-parameters'),
]