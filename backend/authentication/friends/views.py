from rest_framework.views import APIView
from users.models import UserAccount
from friends.models import Friendship
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q  

# Create your views here.
class SendFriendRequestView(APIView):
  def post(self, request):
    data = request.data
    from_user = UserAccount.objects.get(id=data['from_user'])
    try:
      to_user = UserAccount.objects.get(id=data['to_user'])
    except UserAccount.DoesNotExist:
      return Response(status=status.HTTP_404_NOT_FOUND)
    requestor = from_user
    if from_user.id > to_user.id:
      from_user, to_user = to_user, from_user
      requestor = to_user
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

class GetFriendsView(APIView):
  def get(self, request):
    id = request.query_params.get('id')
    user = UserAccount.objects.get(id=id)
    friendships = Friendship.objects.filter(
        Q(user_id1=user) | Q(user_id2=user)
      ).exclude(
        Q(status='REQUEST') & Q(requestor=user)
      )

    user_ids = list(set([friend.user_id1_id for friend in friendships] + [friend.user_id2_id for friend in friendships]))
    users = UserAccount.objects.filter(id__in=user_ids)

    # Create a dictionary mapping user IDs to user data
    user_data = {user.id: {'nick_name': user.nick_name, 'image': user.image.url} for user in users}

    # Serialize friendship data along with user data
    serialized_data = [
            {
                'user': user_data[friend.user_id1_id] if friend.user_id1_id != user.id else user_data[friend.user_id2_id],
                'status': friend.status,
            }
            for friend in friendships
    ]
    return Response(serialized_data)
