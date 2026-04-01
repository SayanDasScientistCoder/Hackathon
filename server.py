import base64
import json
import os
import re
import secrets
import urllib.parse
import urllib.request
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
SESSION_STORE = {}
OAUTH_STATES = {}
STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "your", "into", "are", "how", "what",
    "about", "have", "will", "you", "our", "their", "they", "them", "more", "than", "just",
    "used", "using", "video", "videos", "channel", "channels", "podcast", "official"
}
INTEREST_ALIASES = {
    "ai": {"ai", "artificial", "intelligence", "machine", "learning", "llm", "gpt", "neural"},
    "technology": {"technology", "tech", "software", "coding", "programming", "developer"},
    "science": {"science", "physics", "chemistry", "biology", "research"},
    "space": {"space", "astronomy", "nasa", "cosmos", "rocket"},
    "business": {"business", "startup", "finance", "economics", "market", "investing"},
    "wellness": {"wellness", "health", "fitness", "sleep", "nutrition", "mindfulness"},
    "music": {"music", "songs", "concert", "audio", "album", "guitar", "piano"},
    "cinematic": {"film", "cinema", "cinematic", "movie", "director", "screenplay"},
    "education": {"education", "tutorial", "explained", "course", "lesson", "learn"},
    "analysis": {"analysis", "review", "breakdown", "essay", "commentary", "explainer"},
    "gaming": {"gaming", "game", "esports", "playthrough"},
    "creative": {"creative", "design", "art", "animation", "storytelling"},
}


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


def tokenize_text(*chunks):
    tokens = []
    for chunk in chunks:
        for token in re.findall(r"[a-zA-Z][a-zA-Z0-9\-]{2,}", (chunk or "").lower()):
            if token not in STOPWORDS:
                tokens.append(token)
    return tokens


def top_terms(tokens, limit=8):
    counts = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [token for token, _ in ranked[:limit]]


def map_tokens_to_interests(tokens):
    mapped = []
    token_set = set(tokens)
    for interest, aliases in INTEREST_ALIASES.items():
        if token_set & aliases:
            mapped.append(interest)
    return mapped


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


def google_oauth_configured():
    return bool(os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("GOOGLE_CLIENT_SECRET"))


def build_google_redirect_uri():
    return os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")


def exchange_google_code(code):
    data = urllib.parse.urlencode({
        "code": code,
        "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
        "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
        "redirect_uri": build_google_redirect_uri(),
        "grant_type": "authorization_code",
    }).encode("utf-8")
    return http_get_json(
        "https://oauth2.googleapis.com/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=data,
    )


def fetch_google_userinfo(access_token):
    return http_get_json(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )


def fetch_youtube_imported_profile(access_token, userinfo):
    channel_payload = http_get_json(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    subscription_payload = http_get_json(
        "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=25",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    tokens = []
    for item in channel_payload.get("items", []):
        snippet = item.get("snippet", {})
        tokens.extend(tokenize_text(snippet.get("title"), snippet.get("description")))
    for item in subscription_payload.get("items", []):
        snippet = item.get("snippet", {})
        tokens.extend(tokenize_text(snippet.get("title"), snippet.get("description")))

    mapped_interests = map_tokens_to_interests(tokens)
    raw_top_terms = top_terms(tokens, limit=10)
    favorite_tags = (mapped_interests + [term for term in raw_top_terms if term not in mapped_interests])[:8] or ["technology", "education", "analysis"]
    preferred_domains = ["Video", "Podcast", "News", "Movie"]
    token_set = set(favorite_tags)
    if {"music", "concert", "audio", "songs"} & token_set:
        preferred_domains = ["Video", "Music", "Podcast", "News"]

    mood_bias = "curious"
    if {"calm", "wellness", "health", "sleep"} & token_set:
        mood_bias = "calm"
    elif {"analysis", "finance", "business"} & token_set:
        mood_bias = "focused"
    elif {"film", "cinematic", "space"} & token_set:
        mood_bias = "reflective"

    return {
        "label": f"{userinfo.get('name', 'Signed-in user')} • YouTube import",
        "bio": "Imported from Google sign-in and YouTube subscriptions. Interests are inferred from subscribed channel metadata and normalized into recommendation themes.",
        "moodBias": mood_bias,
        "preferredDomains": preferred_domains,
        "favoriteTags": favorite_tags,
        "preferredPlatforms": ["YouTube", "Spotify", "TMDB", "BBC", "The Verge"],
        "avoidedTags": [],
        "crossDomainWeight": 1.18,
    }


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
            "publishedAt": snippet.get("publishedAt"),
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
            "publishedAt": track.get("album", {}).get("release_date"),
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
                "publishedAt": None,
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
            "publishedAt": article.get("publishedAt"),
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
            "publishedAt": movie.get("release_date"),
        })
    return items


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/auth/google/start":
            self.handle_google_start()
            return
        if parsed.path == "/auth/google/callback":
            self.handle_google_callback(parsed.query)
            return
        if parsed.path == "/api/profile":
            self.handle_profile()
            return
        if parsed.path == "/api/recommendations":
            self.handle_recommendations(parsed.query)
            return
        super().do_GET()

    def get_session_id(self):
        jar = cookies.SimpleCookie()
        jar.load(self.headers.get("Cookie", ""))
        if "streamsphere_session" in jar:
            return jar["streamsphere_session"].value
        return None

    def get_session(self):
        session_id = self.get_session_id()
        if not session_id:
            return None
        return SESSION_STORE.get(session_id)

    def redirect(self, location, set_cookie=None):
        self.send_response(302)
        self.send_header("Location", location)
        if set_cookie:
            self.send_header("Set-Cookie", set_cookie)
        self.end_headers()

    def handle_google_start(self):
        if not google_oauth_configured():
            self.redirect("/")
            return

        state = secrets.token_urlsafe(24)
        OAUTH_STATES[state] = True
        params = urllib.parse.urlencode({
            "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "redirect_uri": build_google_redirect_uri(),
            "response_type": "code",
            "scope": "openid profile email https://www.googleapis.com/auth/youtube.readonly",
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "consent",
            "state": state,
        })
        self.redirect(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")

    def handle_google_callback(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        state = params.get("state", [""])[0]
        code = params.get("code", [""])[0]
        if not code or state not in OAUTH_STATES:
            self.redirect("/")
            return

        OAUTH_STATES.pop(state, None)
        try:
            token_payload = exchange_google_code(code)
            access_token = token_payload.get("access_token")
            userinfo = fetch_google_userinfo(access_token)
            profile = fetch_youtube_imported_profile(access_token, userinfo)
            session_id = secrets.token_urlsafe(24)
            SESSION_STORE[session_id] = {"profile": profile, "userinfo": userinfo}
            self.redirect("/", set_cookie=f"streamsphere_session={session_id}; Path=/; HttpOnly; SameSite=Lax")
        except Exception:
            self.redirect("/")

    def handle_profile(self):
        session = self.get_session()
        body = json.dumps({
            "configured": google_oauth_configured(),
            "connected": bool(session and session.get("profile")),
            "profile": session.get("profile") if session else None,
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

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
