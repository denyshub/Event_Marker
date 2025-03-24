from django.contrib.auth.models import User
from rest_framework import serializers

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_repeat = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "password", "password_repeat", "email"]

    def validate(self, data):
        # Перевірка на збіг паролів
        if data["password"] != data["password_repeat"]:
            raise ValidationError({"password_repeat": "Passwords do not match."})

        # Перевірка на унікальність email
        if User.objects.filter(email=data["email"]).exists():
            raise ValidationError({"email": "This email is already taken."})

        return data

    def create(self, validated_data):
        validated_data.pop("password_repeat")
        user = User.objects.create_user(**validated_data)
        return user
