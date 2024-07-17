from django.urls import path
from .views import GameDataView, UpdateGameInfos

urlpatterns = [
    path('test/', GameDataView.as_view()),
    path('update/', UpdateGameInfos.as_view()),
]

# get all match history
# get specific match history
# create match
# update match