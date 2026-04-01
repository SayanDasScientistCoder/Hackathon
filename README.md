# StreamSphere

StreamSphere is a complete web-based solution for Topic 3 from `Hackathon Topics.pdf`: a generalized recommendation platform that aggregates and suggests content across movies, music, podcasts, videos, and news.

## Why this fits the assignment

- It is a complete product with a working user interface.
- It recommends across multiple domains in one place.
- It works on metadata only: title, description, tags, source platform, and URL.
- It redirects users to the original platform instead of hosting content.
- It is designed like a realistic aggregator layer that could later connect to live APIs.

## Product idea

Users choose:

- mood
- preferred domains
- interest tags
- discovery style

The recommender then ranks content using metadata similarity and cross-domain preference signals. This demonstrates how a unified recommendation system can work even when the content lives on different platforms.

## Files

- `index.html` - product UI
- `styles.css` - visual design and responsive layout
- `app.js` - fallback catalogue, frontend ranking, and live API fetch
- `server.py` - lightweight backend that serves the app and aggregates API results
- `.env.example` - required API keys

## How to run

1. Copy `.env.example` to `.env`
2. Add the API keys you want to use
3. Start the backend:

```bash
python3 server.py
```

Then visit `http://localhost:8000`.

If API keys are missing or an API fails, the UI falls back to the seeded catalogue so the app still works.

## API configuration

- `YOUTUBE_API_KEY` - YouTube Data API key
- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` - needed for Spotify client credentials flow
- `NEWS_API_KEY` - NewsAPI key
- `TMDB_API_KEY` - TMDB API Read Access Token

## Current live sources

- TMDB movie search results are normalized as `Movie`
- YouTube search results are normalized as `Video`
- Spotify track results are normalized as `Music`
- Spotify show results are normalized as `Podcast`
- NewsAPI article results are normalized as `News`

## Official API notes

As of April 1, 2026:

- TMDB official docs expose `GET /3/search/movie` for movie title search and support bearer-token authentication.
- YouTube Data API official docs say projects have a default allocation of 10,000 quota units per day.
- Spotify official docs support server-side OAuth flows such as client credentials, which is why this app now uses a backend instead of exposing secrets in the browser.
- NewsAPI official docs confirm API-key authentication for development use.

## Future extension for hackathon discussion

- Replace seeded metadata with YouTube, Spotify, News API, or podcast API feeds.
- Add user login and persistent preference history.
- Use vector embeddings on descriptions and tags for stronger personalization.
- Add feedback loops such as likes, skips, and session-based learning.
