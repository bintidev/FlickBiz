from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "country", "is_private"]
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("profile_picture", "country", "bio", "is_private", "hide_watchlist", "hide_favorites", "preferred_genres")}),
    )