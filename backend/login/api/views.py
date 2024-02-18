from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from login.api.serializers import LoginSerializer
from login.models import Login

@api_view(['GET', ])
def api_detail_login_view(request):
  try:
    login = Login.objects.first()
  except Login.DoesNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)
  
  serializer = LoginSerializer(login)
  return Response(serializer.data)