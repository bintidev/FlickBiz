from django.apps import AppConfig


class MediaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.media"
    label = "media"

    def ready(self):
        # Start the scheduler when the app is ready (only in main process)
        import os
        if os.environ.get("RUN_MAIN") != "true":
            from .scheduler import start_scheduler
            start_scheduler()