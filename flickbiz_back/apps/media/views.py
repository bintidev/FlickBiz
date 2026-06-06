from django.shortcuts import render
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Genre, Tag, Movie, Series, UserMediaStatus, Favorite, WeeklyTrend
from .serializers import (
    GenreSerializer, TagSerializer,
    MovieListSerializer, MovieDetailSerializer,
    SeriesListSerializer, SeriesDetailSerializer,
    UserMediaStatusSerializer, FavoriteSerializer,
    WeeklyTrendSerializer
)
from .filters import MovieFilter, SeriesFilter

# temporal, prueba de endpoints tmdb api
from django.http import JsonResponse
from django.views.decorators.http import require_GET
import os

# Create your views here.

# prueba de los endpoints
@require_GET
def run_fetch(request):
    secret = request.GET.get("key", "")
    if secret != os.environ.get("FETCH_SECRET", ""):
        return JsonResponse({"error": "unauthorized"}, status=401)
    
    from django.core.management import call_command
    from io import StringIO
    out = StringIO()
    try:
        call_command("fetch_movies", "--pages", "3", stdout=out)
        call_command("fetch_series", "--pages", "3", stdout=out)
        call_command("update_trends", stdout=out)
        return JsonResponse({"ok": True, "output": out.getvalue()})
    except Exception as e:
        return JsonResponse({"error": str(e)})


class GenreListView(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class MovieListView(generics.ListAPIView):
    serializer_class = MovieListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ["title", "director"]
    ordering_fields = ["release_date", "average_rating", "popularity"]
    ordering = ["-release_date"]

    def get_queryset(self):
        return Movie.objects.prefetch_related("genres")


class MovieDetailView(generics.RetrieveAPIView):
    queryset = Movie.objects.prefetch_related("genres", "tags", "availability")
    serializer_class = MovieDetailSerializer
    permission_classes = [permissions.AllowAny]


class SeriesListView(generics.ListAPIView):
    serializer_class = SeriesListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SeriesFilter
    search_fields = ["title", "network"]
    ordering_fields = ["release_date", "average_rating", "popularity"]
    ordering = ["-release_date"]

    def get_queryset(self):
        return Series.objects.prefetch_related("genres")


class SeriesDetailView(generics.RetrieveAPIView):
    queryset = Series.objects.prefetch_related("genres", "tags", "availability")
    serializer_class = SeriesDetailSerializer
    permission_classes = [permissions.AllowAny]


class UserMediaStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Return all media statuses for the logged in user
        statuses = UserMediaStatus.objects.filter(user=request.user)
        serializer = UserMediaStatusSerializer(statuses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserMediaStatusSerializer(data=request.data)
        if serializer.is_valid():
            # Remove existing status for this media item before creating new one
            movie = request.data.get("movie")
            series = request.data.get("series")
            if movie:
                UserMediaStatus.objects.filter(user=request.user, movie_id=movie).delete()
            if series:
                UserMediaStatus.objects.filter(user=request.user, series_id=series).delete()
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        movie = request.data.get("movie")
        series = request.data.get("series")
        UserMediaStatus.objects.filter(
            user=request.user,
            movie_id=movie,
            series_id=series
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FavoriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        movie = request.data.get("movie")
        series = request.data.get("series")
        Favorite.objects.filter(
            user=request.user,
            movie_id=movie,
            series_id=series
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WeeklyTrendView(generics.ListAPIView):
    serializer_class = WeeklyTrendSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Return trends for the current week only
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())
        return WeeklyTrend.objects.filter(week_start=week_start).select_related("movie", "series")[:10]


class DiscoverView(APIView):
    # "Surprise me" button - returns a random media item based on user preferences
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        preferred_genres = request.user.preferred_genres.all()

        movie = Movie.objects.filter(genres__in=preferred_genres).order_by("?").first()
        series = Series.objects.filter(genres__in=preferred_genres).order_by("?").first()

        return Response({
            "movie": MovieListSerializer(movie).data if movie else None,
            "series": SeriesListSerializer(series).data if series else None,
        })