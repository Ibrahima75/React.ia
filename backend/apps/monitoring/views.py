from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from apps.chat.models import Conversation, Message, ApiLog
from apps.models_config.models import AIModel
from apps.authentication.models import User
from services.quota_manager import quota_manager


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    now = timezone.now()
    last_30_days = now - timedelta(days=30)

    # Global stats
    total_conversations = Conversation.objects.count()
    total_messages = Message.objects.count()
    active_users = User.objects.filter(conversations__created_at__gte=last_30_days).distinct().count()
    errors_429 = ApiLog.objects.filter(status_code=429).count()

    # Requests per model
    requests_per_model = (
        ApiLog.objects
        .values('model__nom', 'model__slug')
        .annotate(total=Count('id'), tokens=Sum('tokens_used'))
        .order_by('-total')
    )

    # Tokens per day (last 7 days)
    tokens_per_day = []
    for i in range(7):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        tokens = ApiLog.objects.filter(created_at__range=(day_start, day_end)).aggregate(
            t=Sum('tokens_used')
        )['t'] or 0
        tokens_per_day.append({'date': day_start.strftime('%Y-%m-%d'), 'tokens': tokens})

    # Recent 429 errors
    recent_errors = ApiLog.objects.filter(status_code=429).select_related('model', 'user').order_by('-created_at')[:20]
    errors_data = [
        {
            'id': e.id,
            'model': e.model.slug if e.model else None,
            'user': e.user.email if e.user else None,
            'created_at': e.created_at,
            'error_message': e.error_message,
        }
        for e in recent_errors
    ]

    # Live quota status
    models = AIModel.objects.filter(actif=True)
    quota_data = {m.slug: quota_manager.get_status(m.slug) for m in models}

    return Response({
        'stats': {
            'total_conversations': total_conversations,
            'total_messages': total_messages,
            'active_users': active_users,
            'errors_429': errors_429,
        },
        'requests_per_model': list(requests_per_model),
        'tokens_per_day': list(reversed(tokens_per_day)),
        'recent_errors': errors_data,
        'quota_status': quota_data,
    })
