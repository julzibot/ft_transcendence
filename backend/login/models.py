from django.db import models

# Create your models here.
class Login(models.Model):

  username = models.CharField(max_length=255)
  password = models.CharField(max_length=255)
  login_date = models.DateField(auto_now=True)
  is_logged = models.BooleanField()

  class Meta:
    verbose_name = 'Login'
    verbose_name_plural = 'Logins'

