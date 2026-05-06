from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    profile_picture = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
    country = models.CharField(max_length=2, blank=True)  # ISO 3166-1 alpha-2 (ES, US...)
    bio = models.TextField(blank=True)
    is_private = models.BooleanField(default=False)

    # Privacy settings
    hide_watchlist = models.BooleanField(default=False)
    hide_favorites = models.BooleanField(default=False)

    preferred_genres = models.ManyToManyField(
        "media.Genre",
        blank=True,
        related_name="users"
    )

    def __str__(self):
        return self.username