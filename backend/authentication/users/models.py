from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from faker import Faker

fake = Faker()
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
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class UserAccount(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=60, unique=True)
    nick_name = models.CharField(max_length=60, default=fake.name())
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True
    )
    image = models.CharField(max_length=255, blank=True, null=True, default="https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg") # find a way to store a default profile picture
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
