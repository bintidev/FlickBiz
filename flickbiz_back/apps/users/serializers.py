from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "country"]

    def create(self, validated_data):
        # Password is automatically hashed by create_user
        user = User.objects.create_user(**validated_data)
        return user


class UserPublicSerializer(serializers.ModelSerializer):
    # Safe serializer for public profiles
    class Meta:
        model = User
        fields = ["id", "username", "profile_picture", "country", "bio"]


class UserPrivateSerializer(serializers.ModelSerializer):
    # Full serializer for the user's own profile
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "profile_picture",
            "country", "bio", "is_private",
            "hide_watchlist", "hide_favorites", "preferred_genres"
        ]
        read_only_fields = ["id", "username"]