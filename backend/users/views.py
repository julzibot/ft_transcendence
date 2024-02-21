from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from .models import UserAccount
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
import datetime, jwt
from .serializers import UserAccoutSerializer
from django.conf import settings

# Register New User in Database
class RegisterView(APIView):
  def post(self, request):
    serializer = UserAccoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

# Fecths User in Database and returns its tokens
class LoginView(APIView):
  def post(self, request):
    email = request.data['email']
    name = request.data['name']
    # password = request.data['password']

    user = UserAccount.objects.filter(email=email).first()

    if user is None:
      raise AuthenticationFailed('User not found.')
    
    # if not user.check_password(password):
    #   raise AuthenticationFailed('Incorrect Password')

    access_token = AccessToken.for_user(user)
    refresh_token = RefreshToken.for_user(user)

    response = Response()
    # response.set_cookie(key='jwt-access', value = access_token, httponly=True)
    # response.set_cookie(key='jwt-refresh', value = refresh_token, httponly=True)
    response.data = {
      'user': {
        'id': user.id,
        'name': str(name),
        'email': str(email)
      },
      'backendTokens': {
      'accessToken': str(access_token),
      'refreshToken': str(refresh_token)
      }
    }
    return response
  
class UserView(APIView):
  def get(self, request):
    access_token = request.META.get('HTTP_AUTHORIZATION')
    access_token = access_token.split(' ')[1]
    # refresh_token = request.COOKIES.get('jwt-refresh')

    if not access_token:
      raise AuthenticationFailed('Unauthenticated')
    try:
      payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
      raise AuthenticationFailed('Unauthenticated')
    
    user = UserAccount.objects.filter(id=payload['id']).first()
    serializer = UserAccoutSerializer(user)
  
    return Response(serializer.data)

class LogoutView(APIView):
  def post(self, request):
    response = Response()
    response.delete_cookie('jwt-access')
    response.delete_cookie('jwt-refresh')
    response.data = {
      'message': 'success'
    }
    return response
  