from rest_framework.views import APIView
from users.models import UserAccount
from friends.models import FriendRequest
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
class SendFriendRequestView(APIView):
  def post(self, request):
    data = request.data
    from_user = UserAccount.objects.get(id=data['from_user'])
    try:
      to_user = UserAccount.objects.get(id=data['to_user'])
    except UserAccount.DoesNotExist:
      return Response(status=status.HTTP_404_NOT_FOUND)
    friend_request, created = FriendRequest.objects.get_or_create(from_user = from_user, to_user = to_user)
    print(friend_request)
    if created:
      return Response(data={"request_id": friend_request.id}, status=status.HTTP_201_CREATED)
    else:
      return Response(status=status.HTTP_409_CONFLICT)