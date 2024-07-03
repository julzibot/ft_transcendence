from django.urls import path
from .views import GameCustomizationView, UpdateGameCustomizationView

urlpatterns = [
	path('', UpdateGameCustomizationView.as_view(), name='update-game-customization'),
	path('<int:id>', GameCustomizationView.as_view(), name='game-customization'),
]