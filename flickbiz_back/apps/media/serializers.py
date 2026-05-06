from rest_framework import serializers
from .models import Genre, Tag, Movie, Series, CountryAvailability, UserMediaStatus, Favorite, WeeklyTrend


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "tmdb_id"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class CountryAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CountryAvailability
        fields = ["country_code", "provider"]


class MovieListSerializer(serializers.ModelSerializer):
    # Lightweight serializer for list views
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id", "title", "poster", "release_date",
            "average_rating", "genres"
        ]


class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    availability = CountryAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id", "title", "original_title", "synopsis", "poster",
            "backdrop", "release_date", "language", "average_rating",
            "popularity", "director", "budget", "revenue", "runtime",
            "genres", "tags", "availability", "tmdb_id"
        ]


class SeriesListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = [
            "id", "title", "poster", "release_date",
            "average_rating", "genres", "status"
        ]


class SeriesDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    availability = CountryAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = [
            "id", "title", "original_title", "synopsis", "poster",
            "backdrop", "release_date", "language", "average_rating",
            "popularity", "num_seasons", "num_episodes", "episode_runtime",
            "status", "network", "genres", "tags", "availability", "tvmaze_id"
        ]


class UserMediaStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMediaStatus
        fields = ["id", "user", "movie", "series", "status", "started_at", "finished_at"]
        read_only_fields = ["user"]


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "user", "movie", "series", "added_at"]
        read_only_fields = ["user", "added_at"]


class WeeklyTrendSerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    series = SeriesListSerializer(read_only=True)

    class Meta:
        model = WeeklyTrend
        fields = ["week_start", "movie", "series", "view_count"]