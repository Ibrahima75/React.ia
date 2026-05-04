import json
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation, Message, ApiLog
from .serializers import ConversationSerializer, ConversationListSerializer, MessageSerializer
from apps.models_config.models import AIModel
from services.llm.router import llm_router
from services.quota_manager import quota_manager


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    conversation_id = request.data.get('conversation_id')
    model_slug = request.data.get('model_slug', 'gemini-flash')
    message_content = request.data.get('message', '')
    file_context = request.data.get('file_context', '')  # text extracted from uploaded file

    if not message_content and not file_context:
        return Response({'error': 'Message vide.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or create conversation
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        title = message_content[:60] if message_content else 'Conversation avec fichier'
        conversation = Conversation.objects.create(user=request.user, titre=title)

    # Build full prompt with optional file context
    full_content = message_content
    if file_context:
        full_content = f"[Fichier joint]\n{file_context}\n\n{message_content}" if message_content else f"[Fichier joint]\n{file_context}"

    # Save user message
    user_msg = Message.objects.create(
        conversation=conversation,
        role='user',
        contenu=full_content,
    )

    # Build message history for LLM
    history = []
    for msg in conversation.messages.exclude(id=user_msg.id).order_by('created_at'):
        history.append({'role': msg.role, 'content': msg.contenu})
    history.append({'role': 'user', 'content': full_content})

    # Route through LLM service with fallback logic
    result = llm_router.send(
        messages=history,
        preferred_slug=model_slug,
        user=request.user,
    )

    ai_model = None
    if result.get('model_slug'):
        ai_model = AIModel.objects.filter(slug=result['model_slug']).first()

    # Save assistant response
    assistant_msg = Message.objects.create(
        conversation=conversation,
        model=ai_model,
        role='assistant',
        contenu=result.get('content', ''),
        tokens_used=result.get('tokens_used', 0),
    )

    conversation.save()  # bump updated_at

    return Response({
        'conversation_id': conversation.id,
        'conversation_titre': conversation.titre,
        'user_message': MessageSerializer(user_msg).data,
        'assistant_message': MessageSerializer(assistant_msg).data,
        'model_used': result.get('model_used'),
        'model_switched': result.get('model_switched', False),
        'switch_reason': result.get('switch_reason', ''),
        'quota_status': quota_manager.get_status(result.get('model_slug', model_slug)),
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def conversations(request):
    if request.method == 'GET':
        convs = Conversation.objects.filter(user=request.user)
        return Response(ConversationListSerializer(convs, many=True).data)

    # POST: create new conversation
    titre = request.data.get('titre', 'Nouvelle conversation')
    conv = Conversation.objects.create(user=request.user, titre=titre)
    return Response(ConversationSerializer(conv).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, pk):
    try:
        conv = Conversation.objects.get(id=pk, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        conv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(ConversationSerializer(conv).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_conversation(request, pk):
    try:
        conv = Conversation.objects.get(id=pk, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    fmt = request.query_params.get('format', 'json')
    messages = conv.messages.all().order_by('created_at')

    if fmt == 'txt':
        lines = [f"Conversation: {conv.titre}", f"Date: {conv.created_at}", "---"]
        for msg in messages:
            lines.append(f"[{msg.role.upper()}] {msg.contenu}")
        content = '\n\n'.join(lines)
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="conversation-{pk}.txt"'
        return response

    # JSON export
    data = {
        'id': conv.id,
        'titre': conv.titre,
        'created_at': str(conv.created_at),
        'messages': [
            {
                'role': m.role,
                'contenu': m.contenu,
                'model': m.model.slug if m.model else None,
                'tokens_used': m.tokens_used,
                'created_at': str(m.created_at),
            }
            for m in messages
        ],
    }
    response = HttpResponse(json.dumps(data, ensure_ascii=False, indent=2), content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="conversation-{pk}.json"'
    return response
