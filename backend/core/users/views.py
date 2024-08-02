from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import (TokenRefreshView)
from django.contrib.auth.hashers import make_password, check_password

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseBadRequest
from django.db.models import Q 

import jwt, os, datetime

from .models import UserAccount
from friends.models import Friendship
from .serializers import UserAccountSerializer
from dashboard.models import DashboardData

def get_tokens_for_user(user):
  refresh = RefreshToken.for_user(user)
  access = refresh.access_token
  return{
    'refresh': str(refresh),
    'access': str(access),
    'expiresIn': access.payload['exp']
  }

class CustomTokenRefreshView(TokenRefreshView):
  def post(self, request, *args, **kwargs):
    refresh_token = request.META.get('HTTP_AUTHORIZATION')
    if not refresh_token:
      return Response({'error': 'Authorization: Refresh is required'}, status=status.HTTP_400_BAD_REQUEST)
    refresh_token = refresh_token.split(' ')
    if refresh_token[0] != 'Refresh':
      return Response({'error': 'Authorization: Refresh is required'}, status=status.HTTP_400_BAD_REQUEST)

    refresh_token = refresh_token[1]
    if not refresh_token:
      raise AuthenticationFailed('Unauthenticated')
    try:
      payload = jwt.decode(refresh_token, os.getenv('TOKEN_SIGNING_KEY'), algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
      raise AuthenticationFailed('Unauthenticated')
    user = UserAccount.objects.filter(id=payload['id']).first()
    
    access_token = AccessToken.for_user(user)

    return Response({
      'access': str(access_token),
      'refresh': str(refresh_token),
      'expiresIn': access_token.payload['exp']
    })


class RegisterView(APIView):
  def post(self, request):
    data = request.data['data']
    if len(data['email']) < 1 or len(data['username']) < 1 or len(data['password']) < 1 or len(data['rePass']) < 1:
      return Response({'message': 'email, nick name and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if  UserAccount.objects.filter(email=data['email']).exists():
      return Response({'message': 'user already exists try another email'}, status=status.HTTP_409_CONFLICT)
    if  UserAccount.objects.filter(username=data['username']).exists():
      return Response({'message': 'username is already taken'}, status=status.HTTP_409_CONFLICT)
    if data['password'] != data['rePass']:
      return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    user = UserAccount.objects.create(username=data['username'], email=data['email'], password=make_password(data['password']))
    user.save_image_from_url()
    serializer = UserAccountSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

class OauthView(APIView):
  def post(self, request):
    data = request.data['user']
    try:
      user = UserAccount.objects.get(email=data['email'])
    except ObjectDoesNotExist:
      serializer = UserAccountSerializer(data=data)
      serializer.is_valid(raise_exception=True)
      user = UserAccount.objects.create(**data)
      user.save_image_from_url()

    backendTokens = get_tokens_for_user(user)
    user.is_online = True
    user.save()
    response = Response({
      'user': {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'image': user.image.url
      },
      'backendTokens': backendTokens
    })
    return response


class AccessTokenView(APIView):
  def post(self, request):
    data = request.data['user']
    
    try:
      if 'email' not in data:
        return HttpResponseBadRequest({'Bad Request: email field is required'})
      user = UserAccount.objects.get(email=data['email'])
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    DashboardData.objects.create(user_id=user)
    backendTokens = get_tokens_for_user(user)
    response = Response({
      'user': {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'image': user.image.url
      },
      'backendTokens': backendTokens
    })
    return response
  
class SigninView(APIView):
    def post(self, request):
      data = request.data['user']
      if len(data['email']) < 1:
        return Response(status=status.HTTP_400_BAD_REQUEST)
      try:
        user = UserAccount.objects.get(Q(email=data['email']) | Q(username=data['email']))
      except ObjectDoesNotExist:
        return Response({'message': 'User does not exists, try different credentials'}, status=status.HTTP_404_NOT_FOUND)
      if not check_password(data['password'], user.password):
        return Response({
          "error": "Unauthorized",
          "message": "The password provided does not match our records. Please double-check your password and try again."
        }, status=status.HTTP_401_UNAUTHORIZED)
      user.is_online = True
      user.save()
      response = Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'image': user.image.url,
      })
      return response

class UserView(APIView):
  def get(self, request):
    access_token = request.META.get('HTTP_AUTHORIZATION')

    if not access_token:
      return Response({'error': 'Authorization: Bearer is required'}, status=status.HTTP_400_BAD_REQUEST)
    access_token = access_token.split(' ')
    if access_token[0] != 'Bearer':
      return Response({'error': 'Authorization: Bearer is required'}, status=status.HTTP_400_BAD_REQUEST)
    access_token = access_token[1]
    if not access_token:
      raise AuthenticationFailed('Unauthenticated')
    try:
      payload = jwt.decode(access_token, os.getenv('TOKEN_SIGNING_KEY'), algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
      raise AuthenticationFailed('Unauthenticated')
    
    user = UserAccount.objects.filter(id=payload['id']).first()
    serializer = UserAccountSerializer(user)
  
    return Response(serializer.data)

class UpdateNameView(APIView):
  def put(self, request):
    instance = UserAccount.objects.get(email=request.data['email'])
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
    return Response(status=status.HTTP_200_OK)
    
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
        friendship = Friendship.objects.filter(Q(user1=user, user2=query_user) | Q(user1=query_user, user2=user)).exclude(status='REQUEST').first()

        if friendship:
          friendship_status = friendship.status
        else:
          friendship_status = 'NONE'
        user_data = {
          'id': user.id,
          'username': user.username,
          'image': user.image.url if user.image else None,
          'friendship_status': friendship_status,
          'is_online' : user.is_online
        }
        users_data.append(user_data)
      return Response({"users": users_data})
    return Response(status=status.HTTP_404_NOT_FOUND)
  
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
    user.delete_image()
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

    
class SignOutView(APIView):
  def put(self, request):
    data = request.data['id']
    print(data)
    user = UserAccount.objects.get(id=data)
    user.is_online = False
    user.save()
    return Response(status=status.HTTP_200_OK)