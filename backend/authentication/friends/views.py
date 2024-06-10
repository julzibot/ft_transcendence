from rest_framework.views import APIView
from users.models import UserAccount
from friends.models import Friendship
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
    requestor = "UID1"
    if from_user.id > to_user.id:
      from_user, to_user = to_user, from_user
      requestor = "UID2"
    friend_request, created = Friendship.objects.get_or_create(user_id1 = from_user, user_id2 = to_user, requestor = requestor, status="REQUEST")
    if created:
      return Response(data={"request_id": friend_request.id}, status=status.HTTP_201_CREATED)
    else:
      return Response(status=status.HTTP_409_CONFLICT)
  
class ApprouveFriendRequest(APIView):
  def put(self, request):
    data = request.data
    approuving_user_id = data['user_id1']
    pending_user_id = data['user_id2']
    if approuving_user_id > pending_user_id:
      approuving_user_id, pending_user_id = pending_user_id, approuving_user_id
      requestor = "UID1"
    requestor = "UID2"
    user_id1 = UserAccount.objects.get(id = approuving_user_id)
    user_id2 = UserAccount.objects.get(id = pending_user_id)
    friendship = Friendship.objects.filter(user_id1 = user_id1, user_id2 = user_id2, requestor = requestor, status="REQUEST").first()
    friendship.status = "FRIENDS"
    friendship.save()
    return Response(status=status.HTTP_202_ACCEPTED)
