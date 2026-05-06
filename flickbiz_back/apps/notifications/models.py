from django.db import models

# Create your models here.
class Notification(models.Model):
    TYPE_AVAILABILITY = "availability"
    TYPE_NEW_CONTENT = "new_content"
    TYPE_REVIEW_LIKE = "review_like"
    TYPE_CHOICES = [
        (TYPE_AVAILABILITY, "Availability"),
        (TYPE_NEW_CONTENT, "New Content"),
        (TYPE_REVIEW_LIKE, "Review Like"),
    ]

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Optional links to related content
    movie = models.ForeignKey(
        "media.Movie",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    series = models.ForeignKey(
        "media.Series",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    review = models.ForeignKey(
        "reviews.Review",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} - {self.user.username}"