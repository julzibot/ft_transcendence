from rest_framework import serializers
from login.models import Login


class LoginSerializer(serializers.ModelSerializer):
  model = Login
  fields = ['id', 'username', 'email', 'login_date', 'is_logged', ]