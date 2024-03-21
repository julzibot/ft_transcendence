from django.db import models
from users.models import UserAccount

# Create your models here.
class FriendRequest(models.Model):
  from_user = models.ForeignKey(UserAccount, related_name='from_user', on_delete=models.CASCADE)
  to_user = models.ForeignKey(UserAccount, related_name='to_user', on_delete=models.CASCADE)
