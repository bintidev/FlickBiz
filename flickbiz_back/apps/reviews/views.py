from django.shortcuts import render
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from .filters import ReviewFilter

# Create your views here.
class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReviewFilter
    ordering_fields = ["published_at", "rating", "likes_count"]
    ordering = ["-published_at"]

    def get_queryset(self):
        return Review.objects.select_related("user", "movie", "series").prefetch_related("likes")


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        # Only the author can edit their review
        if review.user != request.user:
            return Response(
                {"error": "You can only edit your own reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        # Only the author can delete their review
        if review.user != request.user:
            return Response(
                {"error": "You can only delete your own reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.user in review.likes.all():
            review.likes.remove(request.user)
            return Response({"liked": False})
        else:
            review.likes.add(request.user)
            return Response({"liked": True})


class PopularReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Order by number of likes descending
        return Review.objects.prefetch_related("likes").order_by("-likes")[:10]