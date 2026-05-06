from django.contrib import admin
from .models import Review

# Register your models here.
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "rating", "published_at", "movie", "series"]
    list_filter = ["rating", "published_at"]
    search_fields = ["title", "user__username"]