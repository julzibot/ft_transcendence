import requests
from django.contrib.auth.backends import BaseBackend
from users.models import UserAccount
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from dashboard.models import DashboardData
from gameCustomization.models import GameCustomizationData

class ExternalAPITokenBackend(BaseBackend):
    def authenticate(self, request, access_token=None, **kwargs):
        if access_token is None:
            return None

        response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if response.status_code != 200:
            return None

        user_info = response.json()

        try:
            user = UserAccount.objects.get(id=user_info['id'])
        except ObjectDoesNotExist:
            user = UserAccount.objects.create(
                id=user_info['id'],
                username=user_info['login'],
                image_url = user_info.get('image', {}).get('versions', {}).get('medium')
            )
            user.save_image_from_url()
            DashboardData.objects.create(user=user)
            GameCustomizationData.objects.create(user=user)
        return user

    def get_user(self, user_id):
        try:
            return UserAccount.objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None