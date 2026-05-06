from django.contrib import admin
from .models import Genre, Tag, Movie, Series, CountryAvailability, UserMediaStatus, Favorite, WeeklyTrend

# Register your models here.
@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ["name", "tmdb_id"]

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ["title", "director", "release_date", "average_rating"]
    list_filter = ["genres", "release_date"]
    search_fields = ["title", "director"]

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "num_seasons", "release_date", "average_rating"]
    list_filter = ["genres", "status"]
    search_fields = ["title"]

@admin.register(CountryAvailability)
class CountryAvailabilityAdmin(admin.ModelAdmin):
    list_display = ["country_code", "movie", "series", "provider"]

@admin.register(UserMediaStatus)
class UserMediaStatusAdmin(admin.ModelAdmin):
    list_display = ["user", "status", "movie", "series"]

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ["user", "movie", "series", "added_at"]

@admin.register(WeeklyTrend)
class WeeklyTrendAdmin(admin.ModelAdmin):
    list_display = ["week_start", "movie", "series", "view_count"]