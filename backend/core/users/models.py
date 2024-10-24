from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.core.files.temp import NamedTemporaryFile
import requests, os
from django.core.files import File
from django.db.models.signals import post_delete
from django.dispatch import receiver
import uuid

class UserAccountManager(BaseUserManager):
    def create_user(self, username, password=None, **kwargs):

        user = self.model(username=username, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **kwargs):
        user = self.create_user(
            username=username,
            password=password,
            **kwargs,
        )
        user.save_image_from_url()
        user.is_staff = True
        user.is_superuser = True

        from dashboard.models import DashboardData
        from gameCustomization.models import GameCustomizationData
        from matchParameters.models import MatchParametersData
        
        DashboardData.objects.create(user=user)
        GameCustomizationData.objects.create(user=user)
        MatchParametersData.objects.create(user=user)

        user.save(using=self._db)
        return user

def upload_image_to(instance, filename):
    # Generate a new filename
    extension = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{extension}"
    return os.path.join('images/', new_filename)

class UserAccount(AbstractBaseUser, PermissionsMixin):
    PROVIDER_CHOICES = [
        ('credentials', 'credentials'),
        ('42-school', '42-school'),
    ]

    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=20, unique=True)
    image = models.ImageField(upload_to=upload_image_to, blank=True, null=True)
    image_url = models.URLField(max_length=512, default="https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='credentials')

    password = models.CharField(max_length=255)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []
    class Meta:
     verbose_name = 'User Account'
     verbose_name_plural = 'User Accounts'

    def __str__(self):
        return self.username

    def delete_image(self):
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)


    def save_image_from_url(self):
        r = requests.get(self.image_url)

        if r.status_code == 200:
            img_temp = NamedTemporaryFile(delete=True)
            img_temp.write(r.content)
            img_temp.flush()
            try:
                self.image.save(self.image_url, File(img_temp), save=True)
            except:
                print("Failed downloading image from ", self.image_url)
                return False
            else:
                return True
        else:
            return False
        

@receiver(post_delete, sender=UserAccount)
def delete_image_on_model_delete(sender, instance, **kwargs):
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)