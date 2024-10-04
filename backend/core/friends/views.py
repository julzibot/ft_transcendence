from rest_framework.views import APIView
from users.models import UserAccount
from friends.models import Friendship
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q 
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class SendFriendRequestView(APIView):
  permission_classes = [IsAuthenticated]

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
  permission_classes = [IsAuthenticated]

  def put(self, request):
      data = request.data
      requestor_id = data.get('requestor_id')
      approving_user_id = data.get('approving_user_id')
      pending_user_id = data.get('pending_user_id')

      if not (requestor_id and approving_user_id and pending_user_id):
          return Response({'error': 'Missing required parameters'}, status=status.HTTP_400_BAD_REQUEST)

      try:
          requestor = UserAccount.objects.get(id=requestor_id)
          user1 = UserAccount.objects.get(id=approving_user_id)
          user2 = UserAccount.objects.get(id=pending_user_id)
          
          friendship = Friendship.objects.filter(
            Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1), 
            requestor=requestor, 
            status="REQUEST"
            ).first()
          
          if not friendship:
              return Response({'error': 'Friendship not found'}, status=status.HTTP_404_NOT_FOUND)

          friendship.status = "FRIENDS"
          friendship.save()
          return Response(status=status.HTTP_202_ACCEPTED)
      
      except UserAccount.DoesNotExist:
          return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
          return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetFriendsView(APIView):
  def get(self, request):
    id = request.query_params.get('id')
    user = UserAccount.objects.get(id=id)
    friendships = Friendship.objects.filter(
        Q(user1=user) | Q(user2=user)
    )
    
    user_ids = list(set([friend.user1_id for friend in friendships] + [friend.user2_id for friend in friendships]))
    users = UserAccount.objects.filter(id__in=user_ids)

    # Create a dictionary mapping user IDs to user data
    user_data = {user.id: {'id': user.id, 'username': user.username, 'image': user.image.url, 'is_online': user.is_online} for user in users}

    # Serialize friendship data along with user data
    serialized_data = [
            {
                'user': user_data[friend.user1.id] if friend.user1.id != user.id else user_data[friend.user2.id],
                'friendship_status': friend.status,
                'requestor': friend.requestor_id
            }
            for friend in friendships
    ]
    return Response(serialized_data)

class DeleteFriendshipView(APIView):
  permission_classes = [IsAuthenticated]

  def delete(self, request):
    data = request.data
    user1 = data['user_id1']
    user2 = data['user_id2']
    friendship = Friendship.objects.filter(
      Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)
    ).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)