from rest_framework import serializers
from .models import UserAccount

class UserAccountSerializer(serializers.ModelSerializer):
  class Meta:
    model = UserAccount
    fields = ['id', 'username', 'image_url', 'image', 'provider', 'is_online']
    extra_kwargs = {
      'password': {'write_only': True},
      'username': {'max_length': 20},
      'image_url': {'write_only': True},
    }

  def create(self, validated_data):
    password = validated_data.pop('password', None)
    instance = self.Meta.model(**validated_data)
    if password is not None:
      instance.set_password(password)
    instance.save()
    return instance
