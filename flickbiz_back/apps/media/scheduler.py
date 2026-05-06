from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command


def fetch_media_job():
    # Runs every Monday at 3am to keep data fresh
    call_command("fetch_movies", pages=3)
    call_command("fetch_series", pages=3)
    call_command("update_trends")


def start_scheduler():
    scheduler = BackgroundScheduler()
    # Update trends every Monday at 3:00am
    scheduler.add_job(
        fetch_media_job,
        trigger=CronTrigger(day_of_week="mon", hour=3, minute=0),
        id="fetch_media",
        replace_existing=True,
    )
    scheduler.start()