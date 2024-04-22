from django.urls import path
from .views import GameDataView, UpdateGameInfos

urlpatterns = [
    path('test/', GameDataView.as_view()),
    path('update/', UpdateGameInfos.as_view()),
]