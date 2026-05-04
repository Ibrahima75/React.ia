from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserPreference
from .serializers import UserPreferenceSerializer


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def preferences(request):
    pref, _ = UserPreference.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserPreferenceSerializer(pref).data)

    serializer = UserPreferenceSerializer(pref, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
