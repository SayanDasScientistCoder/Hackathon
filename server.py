import base64
import json
import os
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def load_env_file():
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file()


def http_get_json(url, headers=None, data=None):
    request = urllib.request.Request(url, headers=headers or {}, data=data)
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def infer_moods_from_tags(tags, requested_mood):
    lowered = {tag.lower() for tag in tags}
    moods = {requested_mood}
    if {"ai", "technology", "science", "education", "analysis"} & lowered:
        moods.update({"curious", "focused"})
    if {"wellness", "calm", "peaceful", "health"} & lowered:
        moods.update({"calm", "reflective"})
    if {"upbeat", "performance", "epic", "live"} & lowered:
        moods.add("energetic")
    if {"emotional", "cinematic", "philosophy"} & lowered:
        moods.add("reflective")
    return sorted(moods)


def build_query(tags, mood):
    top_tags = [tag for tag in tags if tag][:3]
    return " ".join(top_tags or [mood, "recommended"])


def fetch_youtube(tags, mood):
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        return []

    query = build_query(tags, mood)
    params = urllib.parse.urlencode({
        "part": "snippet",
        "type": "video",
        "maxResults": 4,
        "q": query,
        "key": api_key,
    })
    payload = http_get_json(f"https://www.googleapis.com/youtube/v3/search?{params}")
    items = []
    for entry in payload.get("items", []):
        snippet = entry.get("snippet", {})
        video_id = entry.get("id", {}).get("videoId")
        title = snippet.get("title")
        if not title or not video_id:
            continue
        raw_tags = [mood, "video"] + query.split()
        items.append({
            "title": title,
            "domain": "Video",
            "platform": "YouTube",
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "description": snippet.get("description", ""),
            "tags": sorted({tag.lower() for tag in raw_tags}),
            "moods": infer_moods_from_tags(raw_tags, mood),
        })
    return items


def fetch_spotify_token():
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None

    auth = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode("utf-8")
    payload = http_get_json(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data=data,
    )
    return payload.get("access_token")


def fetch_spotify(tags, mood):
    token = fetch_spotify_token()
    if not token:
        return []

    query = build_query(tags, mood)
    items = []
    track_params = urllib.parse.urlencode({
        "q": query,
        "type": "track",
        "limit": 3,
        "market": "IN",
    })
    track_payload = http_get_json(
        f"https://api.spotify.com/v1/search?{track_params}",
        headers={"Authorization": f"Bearer {token}"},
    )

    for track in track_payload.get("tracks", {}).get("items", []):
        title = track.get("name")
        url = track.get("external_urls", {}).get("spotify")
        artist_names = ", ".join(artist.get("name", "") for artist in track.get("artists", []))
        if not title or not url:
            continue
        raw_tags = [mood, "music", "spotify"] + query.split()
        items.append({
            "title": title,
            "domain": "Music",
            "platform": "Spotify",
            "url": url,
            "description": f"Track by {artist_names} from Spotify search results.",
            "tags": sorted({tag.lower() for tag in raw_tags}),
            "moods": infer_moods_from_tags(raw_tags, mood),
        })

    show_params = urllib.parse.urlencode({
        "q": query,
        "type": "show",
        "limit": 3,
        "market": "US",
    })
    try:
        show_payload = http_get_json(
            f"https://api.spotify.com/v1/search?{show_params}",
            headers={"Authorization": f"Bearer {token}"},
        )
        for show in show_payload.get("shows", {}).get("items", []):
            title = show.get("name")
            url = show.get("external_urls", {}).get("spotify")
            publisher = show.get("publisher", "")
            if not title or not url:
                continue
            raw_tags = [mood, "podcast", "spotify"] + query.split()
            items.append({
                "title": title,
                "domain": "Podcast",
                "platform": "Spotify",
                "url": url,
                "description": show.get("description") or f"Podcast show published by {publisher}.",
                "tags": sorted({tag.lower() for tag in raw_tags}),
                "moods": infer_moods_from_tags(raw_tags, mood),
            })
    except Exception:
        pass

    return items


def fetch_news(tags, mood):
    api_key = os.environ.get("NEWS_API_KEY")
    if not api_key:
        return []

    query = build_query(tags, mood)
    params = urllib.parse.urlencode({
        "q": query,
        "language": "en",
        "pageSize": 4,
        "sortBy": "relevancy",
    })
    payload = http_get_json(
        f"https://newsapi.org/v2/everything?{params}",
        headers={"X-Api-Key": api_key},
    )
    items = []
    for article in payload.get("articles", []):
        title = article.get("title")
        url = article.get("url")
        if not title or not url:
            continue
        source_name = article.get("source", {}).get("name", "News source")
        raw_tags = [mood, "news"] + query.split()
        items.append({
            "title": title,
            "domain": "News",
            "platform": source_name,
            "url": url,
            "description": article.get("description") or "Live article pulled from NewsAPI.",
            "tags": sorted({tag.lower() for tag in raw_tags}),
            "moods": infer_moods_from_tags(raw_tags, mood),
        })
    return items


def fetch_tmdb(tags, mood):
    api_key = os.environ.get("TMDB_API_KEY")
    if not api_key:
        return []

    query = build_query(tags, mood)
    params = urllib.parse.urlencode({
        "query": query,
        "include_adult": "false",
        "language": "en-US",
        "page": 1,
    })
    payload = http_get_json(
        f"https://api.themoviedb.org/3/search/movie?{params}",
        headers={
            "Authorization": f"Bearer {api_key}",
            "accept": "application/json",
        },
    )
    items = []
    for movie in payload.get("results", [])[:4]:
        title = movie.get("title")
        movie_id = movie.get("id")
        if not title or not movie_id:
            continue
        overview = movie.get("overview") or "Live movie metadata pulled from TMDB."
        raw_tags = [mood, "movie", "cinematic"] + query.split()
        genre_hint = []
        if "space" in query.lower():
            genre_hint.append("space")
        if "ai" in query.lower() or "technology" in query.lower():
            genre_hint.extend(["technology", "future"])
        if "calm" in query.lower() or "wellness" in query.lower():
            genre_hint.append("reflective")
        items.append({
            "title": title,
            "domain": "Movie",
            "platform": "TMDB",
            "url": f"https://www.themoviedb.org/movie/{movie_id}",
            "description": overview,
            "tags": sorted({tag.lower() for tag in raw_tags + genre_hint}),
            "moods": infer_moods_from_tags(raw_tags + genre_hint, mood),
        })
    return items


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/recommendations":
            self.handle_recommendations(parsed.query)
            return
        super().do_GET()

    def handle_recommendations(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        mood = params.get("mood", ["curious"])[0]
        tags = [tag.strip().lower() for tag in params.get("tags", [""])[0].split(",") if tag.strip()]

        aggregated = []
        active_sources = []
        errors = []

        for source_name, fetcher in (
            ("TMDB", fetch_tmdb),
            ("YouTube", fetch_youtube),
            ("Spotify", fetch_spotify),
            ("NewsAPI", fetch_news),
        ):
            try:
                items = fetcher(tags, mood)
                if items:
                    aggregated.extend(items)
                    active_sources.append(source_name)
            except Exception as exc:
                errors.append(f"{source_name}: {exc}")

        body = json.dumps({
            "items": aggregated,
            "sources": active_sources,
            "errors": errors,
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), AppHandler)
    print(f"Serving StreamSphere on http://127.0.0.1:{port}")
    server.serve_forever()
