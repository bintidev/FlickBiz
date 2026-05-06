from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification_list"),
    path("<int:pk>/", NotificationMarkReadView.as_view(), name="notification_detail"),
    path("read-all/", NotificationMarkAllReadView.as_view(), name="notification_read_all"),
]