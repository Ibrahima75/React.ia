from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AIModel
from .serializers import AIModelSerializer
from services.quota_manager import quota_manager


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_models(request):
    models = AIModel.objects.filter(actif=True)
    data = AIModelSerializer(models, many=True).data
    # Attach live quota counters to each model
    for item in data:
        slug = item['slug']
        item['quota_status'] = quota_manager.get_status(slug)
    return Response(data)
