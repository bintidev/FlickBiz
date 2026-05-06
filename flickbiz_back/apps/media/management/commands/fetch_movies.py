import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.media.models import Movie, Genre, CountryAvailability

TMDB_BASE = settings.TMDB_BASE_URL
TMDB_IMG = settings.TMDB_IMAGE_BASE_URL
API_KEY = settings.TMDB_API_KEY


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


def fetch_movie_details(tmdb_id):
    # Fetch full movie details including credits and watch providers
    url = f"{TMDB_BASE}/movie/{tmdb_id}"
    params = {
        "api_key": API_KEY,
        "append_to_response": "credits,watch/providers"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None


def save_movie(data):
    details = fetch_movie_details(data["id"])
    if not details:
        return

    # Extract director from credits
    director = ""
    credits = details.get("credits", {})
    for person in credits.get("crew", []):
        if person["job"] == "Director":
            director = person["name"]
            break

    movie, created = Movie.objects.update_or_create(
        tmdb_id=data["id"],
        defaults={
            "title": data.get("title", ""),
            "original_title": data.get("original_title", ""),
            "synopsis": data.get("overview", ""),
            "poster": f"{TMDB_IMG}{data['poster_path']}" if data.get("poster_path") else "",
            "backdrop": f"{TMDB_IMG}{data['backdrop_path']}" if data.get("backdrop_path") else "",
            "release_date": data.get("release_date") or None,
            "language": data.get("original_language", ""),
            "average_rating": data.get("vote_average", 0.0),
            "popularity": data.get("popularity", 0.0),
            "director": director,
            "budget": details.get("budget") or None,
            "revenue": details.get("revenue") or None,
            "runtime": details.get("runtime") or None,
        }
    )

    # Assign genres
    genres = get_or_create_genres(data.get("genre_ids", []) or details.get("genres", []))
    movie.genres.set(genres)

    # Save country availability from watch providers
    providers = details.get("watch/providers", {}).get("results", {})
    CountryAvailability.objects.filter(movie=movie).delete()
    for country_code, provider_data in providers.items():
        # flatrate = streaming providers
        for provider in provider_data.get("flatrate", []):
            CountryAvailability.objects.create(
                movie=movie,
                country_code=country_code,
                provider=provider.get("provider_name", "")
            )

    return movie


class Command(BaseCommand):
    help = "Fetch popular and top rated movies from TMDB"

    def add_arguments(self, parser):
        parser.add_argument("--pages", type=int, default=5, help="Number of pages to fetch (20 movies per page)")

    def handle(self, *args, **options):
        load_genre_cache(media_type="movie")
        pages = options["pages"]
        total = 0

        for endpoint in ["popular", "top_rated"]:
            self.stdout.write(f"Fetching {endpoint} movies...")
            for page in range(1, pages + 1):
                url = f"{TMDB_BASE}/movie/{endpoint}"
                params = {"api_key": API_KEY, "page": page}
                response = requests.get(url, params=params)

                if response.status_code != 200:
                    self.stderr.write(f"Error fetching page {page}: {response.status_code}")
                    continue

                movies = response.json().get("results", [])
                for movie_data in movies:
                    save_movie(movie_data)
                    total += 1
                    self.stdout.write(f"  Saved: {movie_data.get('title')}")

        self.stdout.write(self.style.SUCCESS(f"Done. {total} movies processed."))