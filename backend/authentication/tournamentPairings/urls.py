from django.urls import path
from .views import CreateMatchMakingView


urlpatterns = [
  path('createMatchMaking/<int:id>', CreateMatchMakingView.as_view(), name='create-matchMaking'),
]