from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.core.files.temp import NamedTemporaryFile
import requests, os
from django.core.files import File

class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError("Users must have an email address")

        email=self.normalize_email(email)
        email=email.lower()

        user = self.model(
            email=email,
            **kwargs
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **kwargs):
        user = self.create_user(
            email,
            password=password,
            **kwargs,
        )
        user.save_image_from_url()
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

def upload_image_to(instance, filename):
    # Generate a new filename
    extension = filename.split('.')[-1]
    new_filename = f"{instance.id}.{extension}"
    return os.path.join('images/', new_filename)

class UserAccount(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=60, unique=True)
    nick_name = models.CharField(max_length=60, default=f"user{id}")
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True
    )
    image = models.ImageField(upload_to=upload_image_to, blank=True, null=True)
    image_url = models.URLField(max_length=512, default="https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg")

    password = models.CharField(max_length=255)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.email

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
    
    def delete_image(self):
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
