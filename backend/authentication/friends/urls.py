from django.urls import path
from .views import SendFriendRequestView, ApprouveFriendRequest, GetFriendsView

urlpatterns = [
  path('send-friend-request/', SendFriendRequestView.as_view()),
  path('approuve-friend-request/', ApprouveFriendRequest.as_view()),
  path('get/', GetFriendsView.as_view())
]