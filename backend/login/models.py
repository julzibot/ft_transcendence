from django.db import models

# Create your models here.
class Login(models.Model):

  username    = models.CharField(max_length=255)
  email       = models.EmailField(max_length=255, default='example@example.com')
  login_date  = models.DateField(auto_now=True)
  is_logged   = models.BooleanField()

