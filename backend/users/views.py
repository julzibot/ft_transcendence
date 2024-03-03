from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import (TokenRefreshView)

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseBadRequest

import jwt, os, datetime

from .models import UserAccount
from .serializers import UserAccountSerializer

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


class SignupView(APIView):
  def post(self, request):
    data = request.data
    user = UserAccount.objects.filter(email=data['email'])
    if user:
      return Response({'409': 'User already exists'}, status=status.HTTP_409_CONFLICT)
    serializer = UserAccountSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

class SigninView(APIView):
  def post(self, request):
    data = request.data['user']

    # fetch user in database
    try:
      if 'email' not in data:
        return HttpResponseBadRequest({'Bad Request: email field is required'})
      user = UserAccount.objects.get(email=data['email'])
    except ObjectDoesNotExist:
      if 'id' in data:
        user = UserAccount.objects.filter(id=data['id']).first()
        if user:
          return Response({'Conflict': 'user id already exists'}, status=status.HTTP_409_CONFLICT)
      serializer = UserAccountSerializer(data=data)
      serializer.is_valid(raise_exception=True)
      user = UserAccount.objects.create(**data)
    response = Response({
      'user': {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'image': user.image,
      },
      'backendTokens': get_tokens_for_user(user)
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
    print(request.data)
    instance = UserAccount.objects.get(email=request.data['email'])
    newName = request.data.get('name', None)
    if newName is not None:
      try:
        instance.name = newName
        instance.save()
        return Response({'message': 'username updated successfully'})
      except:
        return Response({'error': 'name already exists'}, status=409)
    else:
      return Response({'error': 'could not update username'})
    
    
