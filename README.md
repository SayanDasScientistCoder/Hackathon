# StreamSphere

StreamSphere is a cross-domain recommendation platform built for Topic 3 from `Hackathon Topics.pdf`.

It aggregates metadata from multiple content platforms, builds a user preference profile, and recommends movies, music, podcasts, videos, and news in one interface. It does not host content. Every recommendation redirects the user to the original source platform.

## Problem Statement

Modern content consumption is fragmented:

- videos live on YouTube
- music and podcasts live on Spotify
- movies live on separate streaming/movie discovery platforms
- news lives on publisher websites

Each platform optimizes recommendations only inside its own ecosystem. Users do not get a unified recommendation experience across formats.

This project solves that by creating a single recommendation layer across domains.

## Assignment Fit

This project directly addresses the assignment brief:

- generalized recommendation platform
- aggregates multiple domains
- personalized cross-domain suggestions
- single interface
- realistic real-world usage
- scalable architecture

Why it matches the intended interpretation of the topic:

- it recommends across movies, music, podcasts, videos, and news
- it works on metadata rather than copyrighted content
- it redirects to original platforms instead of reproducing content
- it can operate with real APIs

## Core Idea

StreamSphere acts like a recommendation layer on top of other content platforms.

The system:

1. collects metadata from external sources
2. normalizes everything into one common schema
3. builds a user preference profile
4. ranks items across domains
5. shows recommendations in one unified feed
6. sends the user to the original platform on click

## Features

- Cross-domain recommendations across:
  - Movies
  - Music
  - Podcasts
  - Videos
  - News
- Modern glassmorphism UI with light/dark mode
- Real API-backed aggregation
- Google / YouTube sign-in
- Imported YouTube-based user profile
- Profile-aware ranking
- Domain balancing in the final feed
- Fallback seeded catalogue if APIs fail
- Source-aware recommendation reasons

## Live Data Sources

The backend currently integrates:

- `TMDB` for movies
- `YouTube Data API` for videos
- `Spotify Web API` for music and podcasts
- `NewsAPI` for news

Each item is normalized into a common structure:

```json
{
  "title": "Example title",
  "domain": "Video",
  "platform": "YouTube",
  "url": "https://...",
  "description": "Short metadata summary",
  "tags": ["ai", "technology", "education"],
  "moods": ["curious", "focused"],
  "publishedAt": "2026-04-01T12:00:00Z"
}
```

## Personalization Model

The app supports two kinds of profile input:

### 1. Built-in local profile presets

These simulate different user types, such as:

- AI builder
- Culture explorer
- Wellness learner

Each preset includes:

- preferred domains
- favorite tags
- preferred platforms
- avoided tags
- mood bias
- cross-domain exploration weight

### 2. Imported Google / YouTube profile

Users can sign in with Google and allow `youtube.readonly`.

The backend then:

- reads the signed-in user’s YouTube subscriptions
- reads the user channel metadata
- extracts keywords from titles/descriptions
- maps noisy tokens into cleaner interest categories
- builds an imported recommendation profile

The imported profile is then used by the frontend ranker.

## Recommendation Logic

The recommender is metadata-driven and profile-aware.

It uses:

- selected mood
- selected discovery mode
- selected active tags
- preferred domains from the profile
- preferred platforms from the profile
- normalized interest concepts
- title/description overlap
- freshness for news
- mild freshness bonus for newer movies
- diversity penalties so one platform/domain does not dominate

### Ranking behavior

The ranking process is:

1. assign a base score to each item
2. boost items that match the user profile and active session intent
3. normalize profile interests into common concepts such as:
   - `ai`
   - `technology`
   - `science`
   - `space`
   - `business`
   - `wellness`
   - `music`
   - `cinematic`
   - `education`
   - `analysis`
   - `creative`
4. apply domain/platform diversity penalties
5. guarantee minimum cross-domain representation where possible
6. produce the final ranked feed

### Why recommendations may still vary

This is still a heuristic recommender, not a learned ML ranking model.

That means recommendation quality depends on:

- API result quality
- how descriptive the external metadata is
- how well the imported profile captures real interests

For a hackathon assignment, this is still a strong and realistic product design because it uses real APIs, real user signals, and scalable metadata-based ranking.

## UI Overview

The user can:

- choose a user profile
- choose mood
- choose discovery mode
- filter preferred formats
- filter interest tags
- sign in with Google / YouTube
- switch between light and dark mode
- generate a balanced cross-domain recommendation feed

Every recommendation card shows:

- content type
- platform
- title
- description
- interest tags
- why it was recommended
- link to original source

## Project Structure

- `index.html`
  Main product UI

- `styles.css`
  Layout, glassmorphism styling, responsiveness, and theme system

- `app.js`
  Frontend state, user profiles, recommendation logic, live API fetch, theme toggle, imported profile activation

- `server.py`
  Static file server, API aggregator, Google OAuth flow, imported profile generation

- `.env.example`
  Template for required environment variables

- `.env`
  Local secrets file for API keys and OAuth credentials

## Setup

### Prerequisites

- Python 3
- Internet connection
- API credentials for the integrated services

### 1. Create the environment file

The repo includes `.env.example`. Copy it to `.env` and fill in your values.

Required variables:

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
TMDB_API_KEY=your_tmdb_api_read_access_token
YOUTUBE_API_KEY=your_youtube_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEWS_API_KEY=your_newsapi_key
```

### 2. Start the server

```bash
python3 server.py
```

### 3. Open the app

Visit:

```text
http://localhost:8000
```

## Google / YouTube OAuth Setup

To enable imported user profiles:

1. Go to Google Cloud Console
2. Enable `YouTube Data API v3`
3. Configure the OAuth consent screen
4. Create an OAuth client of type `Web application`
5. Add this redirect URI:

```text
http://localhost:8000/auth/google/callback
```

6. Put the client ID and secret into `.env`
7. If the app is in testing mode, add your Gmail as a test user

### OAuth scope used

The app uses:

```text
https://www.googleapis.com/auth/youtube.readonly
```

This is used to derive recommendation interests from YouTube subscriptions and channel metadata.

## API Configuration Notes

### TMDB

- Used for movie discovery
- Expects TMDB Read Access Token in bearer format

### YouTube Data API

- Used for video search
- Uses the API key flow for content search
- Uses OAuth for user-specific YouTube profile import

### Spotify Web API

- Used for music and podcast discovery
- Uses client credentials on the backend

### NewsAPI

- Used for live news article metadata

## Fallback Behavior

The app is designed to remain usable even if some APIs fail.

If an API:

- is not configured
- fails temporarily
- returns no items

the UI falls back to the local seeded catalogue so the demo still works.

This is intentional and useful for hackathon demos.

## Demo Flow

Recommended demo flow for presentation:

1. Open the app and show the unified cross-domain interface
2. Show light/dark mode
3. Explain that the platform aggregates metadata, not content
4. Use a built-in profile first
5. Generate recommendations across multiple domains
6. Click `Connect Google / YouTube`
7. Import a real user profile
8. Show how the active profile changes
9. Generate a refreshed recommendation feed
10. Open one or two items on their source platforms

## Why This Is Realistic

This is not a fake standalone recommender for one content type.

It is realistic because:

- it uses actual third-party APIs
- it unifies multiple content domains
- it separates metadata aggregation from content hosting
- it supports authenticated user profile import
- it can scale by replacing heuristics with embeddings or learned ranking later

## Limitations

Current limitations:

- ranking is heuristic, not ML-trained
- imported profile quality depends on the richness of YouTube subscription metadata
- Spotify results can vary depending on regional/search constraints
- some external APIs have quota/rate limits
- OAuth session storage is in-memory and not persisted across server restarts

## Possible Future Improvements

- add persistent database-backed user sessions
- store likes, skips, and clicks as feedback signals
- add embeddings/vector search for better semantic ranking
- introduce per-domain explanation models
- support more content providers
- improve taxonomy mapping for imported YouTube interests
- add user profile editing instead of inference only
- persist imported profile locally for smoother demos

## Submission Notes

This project should be presented as:

- a complete product, not just a prototype script
- a generalized recommendation system
- an aggregator layer over existing content platforms
- a metadata-based recommendation engine

## Security Note

Do not commit `.env`.

The project already ignores `.env` through `.gitignore`. If any credentials were exposed during testing or screenshots, rotate them in the respective provider dashboards.

## Quick Start

```bash
python3 server.py
```

Open `http://localhost:8000`.

If you want imported profile personalization:

- configure Google OAuth
- add yourself as a test user if the app is unverified
- click `Connect Google / YouTube`
