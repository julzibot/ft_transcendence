from django.urls import path
from .views import SendFriendRequestView, ApprouveFriendRequest

urlpatterns = [
  path('send-friend-request/', SendFriendRequestView.as_view()),
  path('approuve-friend-request/', ApprouveFriendRequest.as_view())
]