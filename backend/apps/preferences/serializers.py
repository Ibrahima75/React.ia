from rest_framework import serializers
from .models import UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ('id', 'theme', 'langue', 'tts_enabled', 'stt_enabled')
        read_only_fields = ('id',)
