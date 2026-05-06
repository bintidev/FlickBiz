from django.db import models

# Create your models here.
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    # Custom content tags: feel-good, psychological-thriller, etc.
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class MediaItem(models.Model):
    # Abstract base class shared by Movie and Series
    MEDIA_TYPE_MOVIE = "movie"
    MEDIA_TYPE_SERIES = "series"

    title = models.CharField(max_length=255)
    original_title = models.CharField(max_length=255, blank=True)
    synopsis = models.TextField(blank=True)
    poster = models.URLField(blank=True)
    backdrop = models.URLField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    language = models.CharField(max_length=10, blank=True)
    average_rating = models.FloatField(default=0.0)
    popularity = models.FloatField(default=0.0)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    tvmaze_id = models.IntegerField(unique=True, null=True, blank=True)

    genres = models.ManyToManyField(Genre, blank=True, related_name="%(class)s_items")
    tags = models.ManyToManyField(Tag, blank=True, related_name="%(class)s_items")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title


class Movie(MediaItem):
    director = models.CharField(max_length=255, blank=True)
    budget = models.BigIntegerField(null=True, blank=True)
    revenue = models.BigIntegerField(null=True, blank=True)
    runtime = models.IntegerField(null=True, blank=True)  # minutes

    class Meta:
        ordering = ["-release_date"]


class Series(MediaItem):
    STATUS_ONGOING = "ongoing"
    STATUS_ENDED = "ended"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_ONGOING, "Ongoing"),
        (STATUS_ENDED, "Ended"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    num_seasons = models.IntegerField(default=1)
    num_episodes = models.IntegerField(default=1)
    episode_runtime = models.IntegerField(null=True, blank=True)  # minutes per episode
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ONGOING)
    network = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-release_date"]


class CountryAvailability(models.Model):
    # Tracks in which countries each movie/series is available
    country_code = models.CharField(max_length=2)  # ISO 3166-1 alpha-2

    # Generic relation to support both Movie and Series
    movie = models.ForeignKey(
        Movie,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="availability"
    )
    series = models.ForeignKey(
        Series,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="availability"
    )
    provider = models.CharField(max_length=100, blank=True)  # Netflix, HBO, etc.

    class Meta:
        verbose_name_plural = "country availabilities"

    def __str__(self):
        return f"{self.country_code}"


class UserMediaStatus(models.Model):
    # Tracks watchlist/watching/watched state per user per media item
    STATUS_WATCHLIST = "watchlist"
    STATUS_WATCHING = "watching"
    STATUS_WATCHED = "watched"
    STATUS_CHOICES = [
        (STATUS_WATCHLIST, "Watchlist"),
        (STATUS_WATCHING, "Watching"),
        (STATUS_WATCHED, "Watched"),
    ]

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="media_statuses"
    )
    movie = models.ForeignKey(
        Movie,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="user_statuses"
    )
    series = models.ForeignKey(
        Series,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="user_statuses"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # One status per user per movie/series
        constraints = [
            models.UniqueConstraint(
                fields=["user", "movie"],
                condition=models.Q(movie__isnull=False),
                name="unique_user_movie_status"
            ),
            models.UniqueConstraint(
                fields=["user", "series"],
                condition=models.Q(series__isnull=False),
                name="unique_user_series_status"
            ),
        ]


class Favorite(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    movie = models.ForeignKey(
        Movie,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    series = models.ForeignKey(
        Series,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "movie"],
                condition=models.Q(movie__isnull=False),
                name="unique_user_movie_favorite"
            ),
            models.UniqueConstraint(
                fields=["user", "series"],
                condition=models.Q(series__isnull=False),
                name="unique_user_series_favorite"
            ),
        ]


class WeeklyTrend(models.Model):
    # Snapshot updated every week with view counts
    week_start = models.DateField()
    movie = models.ForeignKey(
        Movie,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="weekly_trends"
    )
    series = models.ForeignKey(
        Series,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="weekly_trends"
    )
    view_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-view_count"]