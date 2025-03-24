from datetime import datetime

from venv import logger

import django_filters
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.core.cache import cache
from django.db.models import Count, Q, prefetch_related_objects, Prefetch
from django.http import JsonResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from events.models import Category, Event
from events.permissions import IsEventAuthor, IsEventAuthorOrAdmin
from events.serializers import (
    CategorySerializer,
    EventSerializer,
    EventListSerializer,
    EventMarkerSerializer,
)
from events.utils import get_coordinates
from subscriptions.models import Subscription


class CategoryView(APIView):

    def get(self, request):
        is_filter = request.query_params.get("filter")
        cache_key = "categories_filtered" if is_filter else "categories_all"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        if is_filter:
            categories = Category.objects.annotate(
                approved_events_count=Count(
                    "events", filter=Q(events__status="approved")
                )
            ).filter(approved_events_count__gt=0)
        else:
            categories = Category.objects.all()

        serializer = CategorySerializer(categories, many=True)
        cache.set(cache_key, serializer.data, timeout=3600)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    start_date = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    category = django_filters.NumberFilter(field_name="category_id")


    class Meta:
        model = Event
        fields = ["category", "min_price", "max_price", "start_date", "end_date"]


class EventPagination(PageNumberPagination):
    page_size = 2  # Adjust page size as needed
    page_size_query_param = "page_size"
    max_page_size = 100


class EventViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    pagination_class = EventPagination
    SEARCH_RADIUS_KM = 50
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    queryset = (
        Event.objects.filter(status="approved")
        .prefetch_related(
            Prefetch(
                'subscriptions',
                queryset=Subscription.objects.select_related('user')
            )
        )
        .annotate(subscription_count=Count("subscriptions"))
        .order_by("-subscription_count")
    )
    def get_serializer_class(self):
        if self.action in ["retrieve", "create", "update", "partial_update", "destroy"]:
            return EventSerializer
        return EventListSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated]
        elif self.action in ["update", "partial_update"]:
            permission_classes = [IsEventAuthor]
        elif self.action == "destroy":
            permission_classes = [IsEventAuthorOrAdmin]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

        return Response(data)

    def _get_city_point(self, city_name):
        if not city_name:
            return None

        try:
            coordinates = get_coordinates(city_name)

            if not coordinates or len(coordinates) != 2:
                logger.error(f"Invalid coordinates for city: {city_name}")
                return None

            lat, lon = coordinates
            return Point(lon, lat, srid=4326)

        except Exception as e:
            logger.error(f"Error getting coordinates for {city_name}: {str(e)}")
            return None

    def list(self, request, *args, **kwargs):
        """List events with markers"""
        cache_key = f"events_list_{request.get_full_path()}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        try:
            city_name = request.query_params.get("city", "").strip("/")
            city_point = None

            if city_name:
                city_cache_key = f"city_point_{city_name}"
                city_point = cache.get(city_cache_key)

                if not city_point:
                    city_point = self._get_city_point(
                        city_name
                    )  # Функція отримання координат
                    if city_point:
                        cache.set(city_cache_key, city_point, timeout=3600)
                    else:
                        return Response(
                            {
                                "error": f"Could not find coordinates for city: {city_name}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            base_queryset = self.filter_queryset(self.get_queryset())

            if city_point:
                radius_meters = self.SEARCH_RADIUS_KM * 1000
                base_queryset = base_queryset.filter(
                    coordinates__distance_lte=(
                        Point(city_point[0], city_point[1]),
                        D(m=radius_meters),
                    )
                )

            page = self.paginate_queryset(base_queryset)
            if page is not None:
                events_serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(events_serializer.data)
            else:
                events_serializer = self.get_serializer(base_queryset, many=True)
                paginated_response = Response(events_serializer.data)

            markers_serializer = EventMarkerSerializer(base_queryset, many=True)

            response_data = {
                "events": paginated_response.data,
                "markers": markers_serializer.data,
                "city": [city_point[1], city_point[0]] if city_point else None,
            }

            cache.set(cache_key, response_data, timeout=3600)  # Кешуємо на 1 годину
            return Response(response_data)

        except Exception as e:
            logger.error(f"Unexpected error in list view: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class UserSubscribedEventsViewSet(ReadOnlyModelViewSet):
    serializer_class = EventListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(subscriptions__user=user).distinct()

    @action(detail=False, methods=["get"], url_path="check-subscriptions")
    def check_subscriptions(self, request):
        user = self.request.user
        subscription = Subscription.objects.filter(user=user).first()
        if subscription:
            return Response({"subscriptions": True})
        else:
            return Response({"subscriptions": False})
