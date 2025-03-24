from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Subscription
from .serializers import SubscriptionSerializer
from rest_framework import viewsets


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user
        return Subscription.objects.filter(user=user)

    def retrieve(self, request, pk=None):
        user = request.user
        subscription = Subscription.objects.filter(user=user, event_id=pk).first()

        if subscription:
            return Response(
                {"subscription": True},
            )
        else:
            return Response({"subscription": False})

    def destroy(self, request, pk=None):
        user = request.user

        subscription = Subscription.objects.filter(user=user, event_id=pk).first()

        if subscription:
            subscription.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"detail": "Subscription not found or not yours."},
                status=status.HTTP_400_BAD_REQUEST,
            )
