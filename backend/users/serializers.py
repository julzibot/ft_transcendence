from rest_framework import serializers
from .models import UserAccount

class UserAccoutSerializer(serializers.ModelSerializer):
  class Meta:
    model = UserAccount
    fields = ['id', 'name', 'email']
    extra_kwargs = {
      'password': {'write_only': True}
    }