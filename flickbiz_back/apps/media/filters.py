import django_filters
from .models import Movie, Series


class MovieFilter(django_filters.FilterSet):
    genre = django_filters.CharFilter(field_name="genres__name", lookup_expr="icontains")
    year = django_filters.NumberFilter(field_name="release_date__year")
    year_min = django_filters.NumberFilter(field_name="release_date__year", lookup_expr="gte")
    year_max = django_filters.NumberFilter(field_name="release_date__year", lookup_expr="lte")
    director = django_filters.CharFilter(lookup_expr="icontains")
    language = django_filters.CharFilter(lookup_expr="iexact")
    tag = django_filters.CharFilter(field_name="tags__slug", lookup_expr="iexact")

    class Meta:
        model = Movie
        fields = ["genre", "year", "year_min", "year_max", "director", "language", "tag"]


class SeriesFilter(django_filters.FilterSet):
    genre = django_filters.CharFilter(field_name="genres__name", lookup_expr="icontains")
    year = django_filters.NumberFilter(field_name="release_date__year")
    year_min = django_filters.NumberFilter(field_name="release_date__year", lookup_expr="gte")
    year_max = django_filters.NumberFilter(field_name="release_date__year", lookup_expr="lte")
    status = django_filters.CharFilter(lookup_expr="iexact")
    language = django_filters.CharFilter(lookup_expr="iexact")
    tag = django_filters.CharFilter(field_name="tags__slug", lookup_expr="iexact")

    class Meta:
        model = Series
        fields = ["genre", "year", "year_min", "year_max", "status", "language", "tag"]