from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.media.models import Movie, Series, WeeklyTrend


class Command(BaseCommand):
    help = "Update weekly trending snapshot based on popularity scores"

    def handle(self, *args, **options):
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())

        # Clear existing trends for this week
        WeeklyTrend.objects.filter(week_start=week_start).delete()

        # Top 10 movies by popularity
        top_movies = Movie.objects.order_by("-popularity")[:10]
        for movie in top_movies:
            WeeklyTrend.objects.create(
                week_start=week_start,
                movie=movie,
                view_count=int(movie.popularity)
            )

        # Top 10 series by popularity
        top_series = Series.objects.order_by("-popularity")[:10]
        for series in top_series:
            WeeklyTrend.objects.create(
                week_start=week_start,
                series=series,
                view_count=int(series.popularity)
            )

        self.stdout.write(self.style.SUCCESS(f"Weekly trends updated for week starting {week_start}."))