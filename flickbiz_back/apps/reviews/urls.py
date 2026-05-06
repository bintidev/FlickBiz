from django.urls import path
from .views import (
    ReviewListView, ReviewDetailView,
    ReviewCreateView, ReviewLikeView,
    PopularReviewsView
)

urlpatterns = [
    path("", ReviewListView.as_view(), name="review_list"),
    path("create/", ReviewCreateView.as_view(), name="review_create"),
    path("<int:pk>/", ReviewDetailView.as_view(), name="review_detail"),
    path("<int:pk>/like/", ReviewLikeView.as_view(), name="review_like"),
    path("popular/", PopularReviewsView.as_view(), name="popular_reviews"),
]