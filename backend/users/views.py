from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from .models import UserAccount
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from .serializers import UserAccoutSerializer
import os
from dotenv import load_dotenv

load_dotenv()

def get_tokens_for_user(user):
  refresh = RefreshToken.for_user(user)

  return{
    'refresh': str(refresh),
    'access': str(refresh.access_token),
  }

def registerUser(data):
  serializer = UserAccoutSerializer(data=data)
  serializer.is_valid(raise_exception=True)
  serializer.save()
  return Response(serializer.data)


class LoginView(APIView):
  def post(self, request):
    data = request.data
    name = data['name']
    email = data['email']
    user = UserAccount.objects.filter(email=email).first()
    
    if not user:
      user = registerUser(data)
    return Response({
      'user': {
        'id': user.id,
        'name': name,
        'email': email
      },
      'backendTokens': get_tokens_for_user(user)})
  
class UserView(APIView):
  def get(self, request):
    access_token = request.META.get('HTTP_AUTHORIZATION')
    access_token = access_token.split(' ')[1]


    if not access_token:
      raise AuthenticationFailed('Unauthenticated')
    try:
      payload = jwt.decode(access_token, os.getenv('TOKEN_SIGNING_KEY'), algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
      raise AuthenticationFailed('Unauthenticated')
    
    user = UserAccount.objects.filter(id=payload['id']).first()
    serializer = UserAccoutSerializer(user)
  
    return Response(serializer.data)

class RefreshView(APIView):
  def post(self, request):
    refresh_token = request.META.get('HTTP_AUTHORIZATION')
    if not refresh_token:
      return Response({'error': 'Authorization: refresh is required'}, status=status.HTTP_400_BAD_REQUEST)
    refresh_token = refresh_token.split(' ')
    if refresh_token[0] != 'Refresh':
      return Response({'error': 'Authorization: refresh is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    refresh_token = refresh_token[1]
    if not refresh_token:
      return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        return Response(
          {
            'refresh': str(refresh),
            'access': access_token
          })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
  