from django.db import models
from django.conf import settings
from apps.models_config.models import AIModel


class Conversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations')
    titre = models.CharField(max_length=255, default='Nouvelle conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return self.titre


class Message(models.Model):
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    contenu = models.TextField()
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.contenu[:50]}'


class ApiLog(models.Model):
    model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, related_name='api_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='api_logs')
    status_code = models.IntegerField()
    tokens_used = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_logs'
        ordering = ['-created_at']
