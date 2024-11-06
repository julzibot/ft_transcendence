from django.urls import path
from .views import GameCustomizationView, UpdateGameCustomizationView

urlpatterns = [
	path('update/', UpdateGameCustomizationView.as_view(), name='update-game-customization'),
	path('<int:id>', GameCustomizationView.as_view(), name='game-customization'),
]