from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserPublicSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    # Poster of the reviewed media item
    media_poster = serializers.SerializerMethodField()
    media_title = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "title", "body", "preview", "rating",
            "published_at", "updated_at", "user",
            "movie", "series", "likes_count",
            "media_poster", "media_title"
        ]
        read_only_fields = ["user", "published_at", "updated_at", "preview"]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_media_poster(self, obj):
        if obj.movie:
            return obj.movie.poster
        if obj.series:
            return obj.series.poster
        return None

    def get_media_title(self, obj):
        if obj.movie:
            return obj.movie.title
        if obj.series:
            return obj.series.title
        return None


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "title", "body", "rating", "movie", "series"]

    def validate(self, data):
        # Must be linked to either a movie or a series, not both
        if not data.get("movie") and not data.get("series"):
            raise serializers.ValidationError("A review must be linked to a movie or a series.")
        if data.get("movie") and data.get("series"):
            raise serializers.ValidationError("A review cannot be linked to both a movie and a series.")
        return data