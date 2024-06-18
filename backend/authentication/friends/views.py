from rest_framework.views import APIView
from users.models import UserAccount
from friends.models import Friendship
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q 
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError

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
    try:
      friend_request, created = Friendship.objects.get_or_create(user1 = from_user, user2 = to_user, requestor = requestor, status="REQUEST")
    except IntegrityError:
      return Response(status=status.HTTP_409_CONFLICT)
    if created:
      return Response(data={"request_id": friend_request.id}, status=status.HTTP_201_CREATED)
    else:
      return Response(status=status.HTTP_409_CONFLICT)
  
class ApproveFriendRequest(APIView):
  def put(self, request):
    data = request.data
    requestor = UserAccount.objects.get(id=data['requestor_id'])
    approving_user_id = data['approving_user_id']
    pending_user_id = data['pending_user_id']
    if approving_user_id > pending_user_id:
      approving_user_id, pending_user_id = pending_user_id, approving_user_id
    user1 = UserAccount.objects.get(id=approving_user_id)
    user2 = UserAccount.objects.get(id=pending_user_id)
    try:
      friendship = Friendship.objects.filter(user1= user1, user2 = user2, requestor = requestor, status="REQUEST").first()
    except ObjectDoesNotExist:
      return Response(status=status.HTTP_404_NOT_FOUND)
    friendship.status = "FRIENDS"
    friendship.save()
    return Response(status=status.HTTP_202_ACCEPTED)

class GetFriendsView(APIView):
  def get(self, request):
    id = request.query_params.get('id')
    user = UserAccount.objects.get(id=id)
    friendships = Friendship.objects.filter(
        Q(user1=user) | Q(user2=user)
      )#.exclude(
          # Q(status='REQUEST') #& Q(requestor=user)
      # )
    user_ids = list(set([friend.user1_id for friend in friendships] + [friend.user2_id for friend in friendships]))
    users = UserAccount.objects.filter(id__in=user_ids)

    # Create a dictionary mapping user IDs to user data
    user_data = {user.id: {'id': user.id, 'nick_name': user.nick_name, 'image': user.image.url} for user in users}

    # Serialize friendship data along with user data
    serialized_data = [
            {
                'user': user_data[friend.user1.id] if friend.user1.id != user.id else user_data[friend.user2.id],
                'status': friend.status,
                'requestor': friend.requestor_id
            }
            for friend in friendships
    ]
    return Response(serialized_data)

class DeleteFriendshipView(APIView):
  def delete(self, request):
    data = request.data
    user1 = data['user_id1']
    user2 = data['user_id2']
    friendship = Friendship.objects.filter(
      Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)
    ).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)