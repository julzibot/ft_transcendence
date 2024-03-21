from django.urls import path
from .views import SendFriendRequestView

urlpatterns = [
  path('send-friend-request/', SendFriendRequestView.as_view())
]