# MoodMap

## Mood-Aware Location Recommendation System

MoodMap is a location discovery web application that recommends nearby places based on a user’s mood and intent (e.g., Work, Date, Budget-friendly). Instead of relying on default API sorting, it applies custom ranking logic, intelligent caching, and contextual reasoning to deliver fast and relevant results.

---

## Key Features

- Mood-based recommendations (Work, Date, Quick Bite, Budget, Custom Vibe)
- Custom ranking engine combining distance, ratings, and context
- Backend-like service layer implemented in the browser for caching and request optimization
- Location-aware search using real GPS coordinates
- Client-side filtering and sorting without redundant API calls
- Mobile-first, responsive UI
- Graceful error handling for geolocation and API failures

---

## Recommendation Intelligence

MoodMap goes beyond simple list rendering by applying a rule-based scoring algorithm to each place.

### Scoring Logic

Each result is assigned an intelligence score that:

- Rewards higher ratings
- Penalizes longer distances
- Applies mood-specific prioritization (e.g., quiet spots for Work, low cost for Budget)

This ensures recommendations are intent-aware, not just proximity-based.

---

## Contextual LLM Usage

The app uses the gemini-2.5-flash model with the Google Maps grounding tool to:

- Ensure all recommendations are real, verifiable locations
- Dynamically adjust reasoning based on the selected mood
- Avoid hallucinated or non-existent places

When structured data is incomplete, heuristic parsing (e.g., regex for ratings or price levels) is used as a fallback.

---

## Architecture Overview

```text
UI Components (React)
        ↓
Service Layer (Simulated Backend)
        ↓
Google Places & Maps APIs
        ↓
Ranking + Filtering Engine
```

## Why a Simulated Backend?

Instead of introducing a trivial Node.js server, MoodMap uses a dedicated service layer in the browser to mimic backend responsibilities:

- Caching with TTL (1 hour) using `localStorage`
- Request grouping by rounding GPS coordinates (~100m)
- Quota and latency reduction for external APIs

This approach keeps the architecture simple while still demonstrating systems-level thinking.

---

## Tech Stack

### Frontend

- React
- TypeScript / JavaScript

### APIs & Services

- Google Maps API
- Google Places API
- Gemini 2.5 Flash (with Google Maps grounding)

---

## Performance & UX

- Client-side caching
- Skeleton loaders
- Debounced interactions

---

## Core Engineering Enhancements

### Caching & Request Coalescing

Repeated searches within the same area and mood are served instantly from cache.

### Client-Side Sorting & Filtering

Users can sort by relevance, rating, or distance and filter by “Open Now” or minimum rating without re-fetching data.

### Loading Skeletons

Improves perceived performance during API calls.

### Error Recovery

Graceful handling of:

- Location permission denials
- API failures
- Network issues

## Setup Instructions

### Clone the repository

```bash
git clone https://github.com/Nihit3003/moodmap.git
cd moodmap
```
Create a .env file
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

Install dependencies
npm install

Start the development server
npm run dev

