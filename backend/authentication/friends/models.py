from django.db import models
from users.models import UserAccount

class Friendship(models.Model):

    class STATUS_CHOICES(models.TextChoices):
      FRIENDS = 'FRIENDS',
      REQUEST = "REQUEST"
    user_id1 = models.ForeignKey(UserAccount, related_name='user_id1_friendrequests', on_delete=models.CASCADE)
    user_id2 = models.ForeignKey(UserAccount, related_name='user_id2_friendrequests', on_delete=models.CASCADE)
    requestor = models.ForeignKey(UserAccount, related_name='requestor', on_delete=models.CASCADE)
    status = models.CharField(max_length=7, choices=STATUS_CHOICES)
    request_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)