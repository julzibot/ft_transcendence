import requests
from django.contrib.auth.backends import BaseBackend
from users.models import UserAccount
from django.conf import settings

class ExternalAPITokenBackend(BaseBackend):
    def authenticate(self, request, access_token=None, **kwargs):
        if access_token is None:
            return None

        # Call the external API to validate the access token and get user info
        response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if response.status_code != 200:
            return None

        user_info = response.json()

        # Get or create the user based on the external API response
        try:
            user = UserAccount.objects.get(username=user_info['login'])
        except User.DoesNotExist:
            user = UserAccount.objects.create(
                id=user_info['id'],
                username=user_info['login'],
                image_url=user_info['image']['verions']['medium'],
            )

        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None