from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'nom', 'email', 'password', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            nom=validated_data['nom'],
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Identifiants invalides.')
        if not user.is_active:
            raise serializers.ValidationError('Compte désactivé.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'nom', 'email', 'created_at')
        read_only_fields = ('id', 'created_at')
