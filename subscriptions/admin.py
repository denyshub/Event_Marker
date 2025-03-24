from django.contrib import admin

from subscriptions.models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    fields = ("event", "user")
    readonly_fields = ("event", "user")
