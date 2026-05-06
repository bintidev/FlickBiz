import django_filters
from .models import Review


class ReviewFilter(django_filters.FilterSet):
    movie = django_filters.NumberFilter(field_name="movie__id")
    series = django_filters.NumberFilter(field_name="series__id")
    user = django_filters.CharFilter(field_name="user__username", lookup_expr="iexact")
    date_from = django_filters.DateFilter(field_name="published_at__date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="published_at__date", lookup_expr="lte")
    rating = django_filters.NumberFilter()
    rating_min = django_filters.NumberFilter(field_name="rating", lookup_expr="gte")
    rating_max = django_filters.NumberFilter(field_name="rating", lookup_expr="lte")

    class Meta:
        model = Review
        fields = ["movie", "series", "user", "date_from", "date_to", "rating", "rating_min", "rating_max"]