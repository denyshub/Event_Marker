from rest_framework import serializers
from rest_framework.fields import CurrentUserDefault

from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Subscription
        fields = ["event", "user"]
