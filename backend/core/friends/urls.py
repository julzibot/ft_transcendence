from django.urls import path
from .views import SendFriendRequestView, ApproveFriendRequest, GetFriendsView, DeleteFriendshipView

urlpatterns = [
  path('send-friend-request/', SendFriendRequestView.as_view()),
  path('approve-friend-request/', ApproveFriendRequest.as_view()),
  path('get/', GetFriendsView.as_view()),
  path('delete-friendship/', DeleteFriendshipView.as_view())
]