from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.contrib import auth

from .models import UserAccount
from friends.models import Friendship
from .serializers import UserAccountSerializer
from dashboard.models import DashboardData
from matchParameters.models import MatchParametersData
from gameCustomization.models import GameCustomizationData


@method_decorator(csrf_protect, name='dispatch')
class RegisterView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    try:
      data = request.data

      if  UserAccount.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_409_CONFLICT)

      user = UserAccount.objects.create(
        username=data['username'],
        password=make_password(data['password'])
      )

      user.save_image_from_url()
      MatchParametersData.objects.create(user=user)
      DashboardData.objects.create(user=user)
      GameCustomizationData.objects.create(user=user)
      return Response({'success': 'User account successfully created'}, status=status.HTTP_201_CREATED)
    except:
      return Response({'error': 'An internal error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetSCRFTokenView(APIView):
  permission_classes = [AllowAny]
  def get(self, request, format=None):
    return Response({'success': 'CSRF cookie set'})

@method_decorator(csrf_protect, name='dispatch')
class SigninView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
      data = request.data

      user = auth.authenticate(username=data['username'], password=data['password'])
      if user is not None:
        request.session.save()
        auth.login(request, user)
      else:
        return Response({ "message": "Given credentials do not match our records." }, status=status.HTTP_401_UNAUTHORIZED)
      user.is_online = True
      user.save()
      user = {
          'id': user.id,
          'username': user.username,
          'image': user.image.url if user.image else None
      }
      return Response({'user': user}, status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class OauthView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    access_token = request.data.get('access_token')
    if access_token is None:
      return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = auth.authenticate(request, access_token=access_token)
    if user is not None:
      request.session.save()
      auth.login(request, user)
      return Response({
        'message': 'Successfully logged in',
        'session_id': request.session.session_key,
        }, status=status.HTTP_200_OK)
    else:
      return Response({'error': 'Invalid access token'}, status=status.HTTP_401_UNAUTHORIZED)
    

class UpdateNameView(APIView):
  def put(self, request):
    instance = UserAccount.objects.get(username=request.data['username'])
    newName = request.data.get('name', None)
    if newName is not None:
      try:
        instance.username = newName
        instance.save()
        return Response({'message': 'username updated successfully'})
      except:
        return Response({'message': 'This username is already taken'}, status=409)
    else:
      return Response({'error': 'could not update username'})

class UpdateImageView(APIView):
  def put(self, request):
    user = UserAccount.objects.get(id=request.data['user_id'])
    user.delete_image()
    user.image = request.data['image']
    user.save()

    return Response({'image': user.image.url})
    
class SearchUserView(APIView):
  def get(self, request):
    query = request.query_params.get('query')
    id = request.query_params.get('id')
    query_user = UserAccount.objects.get(id=id)
    if len(query) > 0:
      query_set = UserAccount.objects.filter(username__istartswith=query).exclude(id=id)
      if not query_set:
        return Response(status=status.HTTP_404_NOT_FOUND)
      users_data = []
      for user in query_set:
        friendship = Friendship.objects.filter(Q(user1=user, user2=query_user) | Q(user1=query_user, user2=user)).first()

        if friendship:
          friendship_status = friendship.status
          requestor_id = friendship.requestor.id
        else:
          friendship_status = 'NONE'
          requestor_id = None
        user_data = {
          'id': user.id,
          'username': user.username,
          'image': user.image.url if user.image else None,
          'friendship_status': friendship_status,
          'is_online' : user.is_online,
          'requestor_id': requestor_id
        }
        users_data.append(user_data)
      return Response({"users": users_data})
    return Response(status=status.HTTP_204_NO_CONTENT)
  
class UpdatePasswordView(APIView):
  def put(self, request):
    data = request.data
    try:
      user = UserAccount.objects.get(id=data['user_id'])
    except ObjectDoesNotExist:
      return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
    if data['new_password'] != data['rePass']:
      return Response({'message': 'Passwords does not match'}, status=status.HTTP_400_BAD_REQUEST)
    if not check_password(data['old_password'], user.password):
      return Response({'message': 'Password does not match are records, try again'}, status=status.HTTP_400_BAD_REQUEST)
    user.password = make_password(data['new_password'])
    user.save()
    return Response({'message:' 'Password updated successfully'}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
  def delete(self, request):
    data = request.data
    try:
      user = UserAccount.objects.get(id=data['user_id'])
    except ObjectDoesNotExist:
      return Response({'message': 'user does not exists'}, status=status.HTTP_404_NOT_FOUND)
    auth.logout(request)
    user.delete_image()
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

    
class SignOutView(APIView):
  def put(self, request):
    data = request.data['id']
    user = UserAccount.objects.get(id=data)
    user.is_online = False
    user.save()
    return Response(status=status.HTTP_200_OK)

class LogoutView(APIView):
  def post(self, request, format=None):
    try:
      auth.logout(request)
      return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except:
      return Response({'message': 'An internal error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserView(APIView):
  permission_classes = [IsAuthenticated]
  
  def get(self, request):
    serializer = UserAccountSerializer(request.user)
    return Response({'user': serializer.data})

class GetUserInfosView(APIView):
  def get(self, request):
    id = request.query_params.get('id')
    try:
      user = UserAccount.objects.get(id=id)
      user_data = {
        'id': user.id,
        'username': user.username,
        'image': user.image.url if user.image else None
      }
    except ObjectDoesNotExist:
      return Response(status=status.HTTP_404_NOT_FOUND)
    return Response({'user': user_data}, status=status.HTTP_200_OK)