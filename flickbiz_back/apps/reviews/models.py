from django.db import models

# Create your models here.
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    # Short preview shown in listings
    preview = models.CharField(max_length=500, blank=True)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    movie = models.ForeignKey(
        "media.Movie",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    series = models.ForeignKey(
        "media.Series",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    # Likes system for popular reviews section
    likes = models.ManyToManyField(
        "users.User",
        blank=True,
        related_name="liked_reviews"
    )

    class Meta:
        ordering = ["-published_at"]
        # One review per user per movie/series
        constraints = [
            models.UniqueConstraint(
                fields=["user", "movie"],
                condition=models.Q(movie__isnull=False),
                name="unique_user_movie_review"
            ),
            models.UniqueConstraint(
                fields=["user", "series"],
                condition=models.Q(series__isnull=False),
                name="unique_user_series_review"
            ),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-generate preview from body if not provided
        if not self.preview and self.body:
            self.preview = self.body[:497] + "..." if len(self.body) > 500 else self.body
        super().save(*args, **kwargs)