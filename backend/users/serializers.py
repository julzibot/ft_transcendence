from rest_framework import serializers
from .models import UserAccount

class UserAccountSerializer(serializers.ModelSerializer):
  class Meta:
    model = UserAccount
    fields = ['id', 'name', 'email', 'image']
    extra_kwargs = {
      'password': {'write_only': True}
    }