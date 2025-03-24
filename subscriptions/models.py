from django.contrib.auth.models import User
from django.db import models

from events.models import Event


class Subscription(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="subscriptions"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}, {self.event}"

    class Meta:
        unique_together = ("user", "event")
