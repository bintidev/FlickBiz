from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok", "env": {
        "tmdb_key": bool(__import__("os").environ.get("TMDB_API_KEY")),
        "db": bool(__import__("os").environ.get("DATABASE_URL")),
    }})

from django.urls import path
from .views import (
    GenreListView, TagListView,
    MovieListView, MovieDetailView,
    SeriesListView, SeriesDetailView,
    UserMediaStatusView, FavoriteView,
    WeeklyTrendView, DiscoverView,
    run_fetch
)

urlpatterns = [
    path("health/", health),
    path("run-fetch/", run_fetch, name="run-fetch"),
    path("genres/", GenreListView.as_view(), name="genre_list"),
    path("tags/", TagListView.as_view(), name="tag_list"),
    path("movies/", MovieListView.as_view(), name="movie_list"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie_detail"),
    path("series/", SeriesListView.as_view(), name="series_list"),
    path("series/<int:pk>/", SeriesDetailView.as_view(), name="series_detail"),
    path("status/", UserMediaStatusView.as_view(), name="media_status"),
    path("favorites/", FavoriteView.as_view(), name="favorites"),
    path("trending/", WeeklyTrendView.as_view(), name="weekly_trends"),
    path("discover/", DiscoverView.as_view(), name="discover"),
]