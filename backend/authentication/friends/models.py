from django.db import models
from users.models import UserAccount

class FriendList(models.Model):
    user_id1 = models.ForeignKey(UserAccount, related_name='user_id1_friendlists', on_delete=models.CASCADE)
    user_id2 = models.ForeignKey(UserAccount, related_name='user_id2_friendlists', on_delete=models.CASCADE)

class FriendRequest(models.Model):
    class REQUESTOR_CHOICES(models.TextChoices):
      UID1 = 'UID1',
      UID2 = 'UID2'

    user_id1 = models.ForeignKey(UserAccount, related_name='user_id1_friendrequests', on_delete=models.CASCADE)
    user_id2 = models.ForeignKey(UserAccount, related_name='user_id2_friendrequests', on_delete=models.CASCADE)
    requestor = models.CharField(max_length=4, choices=REQUESTOR_CHOICES)
