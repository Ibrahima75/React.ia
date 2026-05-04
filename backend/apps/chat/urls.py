from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.send_message, name='send_message'),
    path('conversations/', views.conversations, name='conversations'),
    path('conversations/<int:pk>/', views.conversation_detail, name='conversation_detail'),
    path('conversations/<int:pk>/export/', views.export_conversation, name='export_conversation'),
]
