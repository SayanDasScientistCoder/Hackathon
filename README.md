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
- `app.js` - seeded metadata catalogue and recommendation logic

## How to run

Open `index.html` directly in a browser.

If you want a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Future extension for hackathon discussion

- Replace seeded metadata with YouTube, Spotify, News API, or podcast API feeds.
- Add user login and persistent preference history.
- Use vector embeddings on descriptions and tags for stronger personalization.
- Add feedback loops such as likes, skips, and session-based learning.
