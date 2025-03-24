from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, UserSubscribedEventsViewSet

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(
    r"subscribed-events", UserSubscribedEventsViewSet, basename="subscribed-events"
)


urlpatterns = [
    path("", include(router.urls)),
]
