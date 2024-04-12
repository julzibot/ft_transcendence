from django.urls import path
from .views import GameDataView

urlpatterns = [
    path('test/', GameDataView.as_view()),
]