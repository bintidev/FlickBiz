import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.media.models import Series, Genre, CountryAvailability

TMDB_BASE = settings.TMDB_BASE_URL
TMDB_IMG = settings.TMDB_IMAGE_BASE_URL
API_KEY = settings.TMDB_API_KEY

# TVMaze base URL (no API key required)
TVMAZE_BASE = "https://api.tvmaze.com"


# Cache of TMDB genre id -> name to avoid repeated API calls
_genre_cache = {}

def load_genre_cache(media_type="movie"):
    # Fetch all genres from TMDB once and store in cache
    url = f"{TMDB_BASE}/genre/{media_type}/list"
    response = requests.get(url, params={"api_key": API_KEY})
    if response.status_code == 200:
        for g in response.json().get("genres", []):
            _genre_cache[g["id"]] = g["name"]


def get_or_create_genres(genre_data):
    genres = []
    for g in genre_data:
        if isinstance(g, int):
            tmdb_id = g
            name = _genre_cache.get(tmdb_id, f"Genre {tmdb_id}")
        else:
            tmdb_id = g["id"]
            name = g["name"]

        genre, _ = Genre.objects.get_or_create(
            tmdb_id=tmdb_id,
            defaults={"name": name}
        )
        genres.append(genre)
    return genres


def fetch_tvmaze_details(series_title):
    # Search TVMaze for extra details not available in TMDB
    url = f"{TVMAZE_BASE}/singlesearch/shows"
    response = requests.get(url, params={"q": series_title})
    if response.status_code == 200:
        return response.json()
    return None


def fetch_series_details(tmdb_id):
    url = f"{TMDB_BASE}/tv/{tmdb_id}"
    params = {
        "api_key": API_KEY,
        "append_to_response": "watch/providers"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None


def save_series(data):
    details = fetch_series_details(data["id"])
    if not details:
        return

    # Map TMDB status to our model choices
    status_map = {
        "Returning Series": Series.STATUS_ONGOING,
        "Ended": Series.STATUS_ENDED,
        "Canceled": Series.STATUS_CANCELLED,
    }
    tmdb_status = details.get("status", "")
    series_status = status_map.get(tmdb_status, Series.STATUS_ONGOING)

    # Try to get network info
    networks = details.get("networks", [])
    network = networks[0]["name"] if networks else ""

    series, created = Series.objects.update_or_create(
        tmdb_id=data["id"],
        defaults={
            "title": data.get("name", ""),
            "original_title": data.get("original_name", ""),
            "synopsis": data.get("overview", ""),
            "poster": f"{TMDB_IMG}{data['poster_path']}" if data.get("poster_path") else "",
            "backdrop": f"{TMDB_IMG}{data['backdrop_path']}" if data.get("backdrop_path") else "",
            "release_date": data.get("first_air_date") or None,
            "language": data.get("original_language", ""),
            "average_rating": data.get("vote_average", 0.0),
            "popularity": data.get("popularity", 0.0),
            "num_seasons": details.get("number_of_seasons", 1),
            "num_episodes": details.get("number_of_episodes", 1),
            "status": series_status,
            "network": network,
        }
    )

    genres = get_or_create_genres(data.get("genre_ids", []) or details.get("genres", []))
    series.genres.set(genres)

    # Save country availability
    providers = details.get("watch/providers", {}).get("results", {})
    CountryAvailability.objects.filter(series=series).delete()
    for country_code, provider_data in providers.items():
        for provider in provider_data.get("flatrate", []):
            CountryAvailability.objects.create(
                series=series,
                country_code=country_code,
                provider=provider.get("provider_name", "")
            )

    return series


class Command(BaseCommand):
    help = "Fetch popular and top rated series from TMDB"

    def add_arguments(self, parser):
        parser.add_argument("--pages", type=int, default=5, help="Number of pages to fetch (20 series per page)")

    def handle(self, *args, **options):
        load_genre_cache(media_type="tv")
        pages = options["pages"]
        total = 0

        for endpoint in ["popular", "top_rated"]:
            self.stdout.write(f"Fetching {endpoint} series...")
            for page in range(1, pages + 1):
                url = f"{TMDB_BASE}/tv/{endpoint}"
                params = {"api_key": API_KEY, "page": page}
                response = requests.get(url, params=params)

                if response.status_code != 200:
                    self.stderr.write(f"Error fetching page {page}: {response.status_code}")
                    continue

                series_list = response.json().get("results", [])
                for series_data in series_list:
                    save_series(series_data)
                    total += 1
                    self.stdout.write(f"  Saved: {series_data.get('name')}")

        self.stdout.write(self.style.SUCCESS(f"Done. {total} series processed."))