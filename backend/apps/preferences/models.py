from django.db import models
from django.conf import settings


class UserPreference(models.Model):
    THEME_CHOICES = [('dark', 'Dark'), ('light', 'Light')]
    LANGUE_CHOICES = [('fr', 'Français'), ('en', 'English')]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='dark')
    langue = models.CharField(max_length=5, choices=LANGUE_CHOICES, default='fr')
    tts_enabled = models.BooleanField(default=False)
    stt_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_preferences'

    def __str__(self):
        return f'Preferences of {self.user.email}'
