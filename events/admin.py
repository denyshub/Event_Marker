from django.contrib import admin
from .models import Category, Event


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    fields = ("name",)


class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "organizer",
        "date",
        "status",
    )
    list_filter = ("status", "date")
    search_fields = (
        "title",
        "organizer__username",
    )

    fields = (
        "title",
        "slug",
        "description",
        "date",
        "location",
        "coordinates",
        "category",
        "status",
        "organizer",
        "website",
        "image",
    )

    readonly_fields = (
        "title",
        "slug",
        "description",
        "location",
        "coordinates",
        "category",
        "organizer",
        "website",
        "image",
        "created_at",
        "updated_at",
    )

    actions = ["approve_event", "reject_event"]

    def approve_event(self, request, queryset):
        queryset.update(status="approved")

    approve_event.short_description = "Approve selected events"

    def reject_event(self, request, queryset):
        queryset.update(status="rejected")

    reject_event.short_description = "Reject selected events"


admin.site.register(Event, EventAdmin)
