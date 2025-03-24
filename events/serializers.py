from django.conf import settings
from django.contrib.gis.geos import Point
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CurrentUserDefault

from .models import Event, Category


class EventListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "image",
            "date",
            "location",
            "description",
            "price",
            "coordinates",
        ]


class EventSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True, required=True)
    longitude = serializers.FloatField(write_only=True, required=True)
    organizer = serializers.HiddenField(default=CurrentUserDefault())
    subscription_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "date",
            "price",
            "location",
            "coordinates",
            "category",
            "organizer",
            "website",
            "image",
            "latitude",
            "longitude",
            "subscription_count",
        )
        read_only_fields = ("organizer",)

    def get_subscription_count(self, obj):

        return obj.subscriptions.count()

    def validate(self, data):
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        try:
            coordinates = Point(longitude, latitude, srid=4326)
            data["coordinates"] = coordinates
        except ValueError:
            raise ValidationError("Latitude and longitude must be valid numbers.")

        data.pop("latitude", None)
        data.pop("longitude", None)
        return data


class EventMarkerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = ["title", "slug", "coordinates", "image"]


class CategorySerializer(serializers.ModelSerializer):
    events_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "events_count"]
