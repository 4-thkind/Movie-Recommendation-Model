<div align="center">

<img src="logo.jpg" alt="ATLASS Logo" width="120" />

# ✦ ATLASS

### *Adaptive Taste Learning And Suggestion System*

> A cinematic discovery engine that thinks like a machine learning model  
> and feels like a streaming platform — built in pure vanilla JavaScript with zero frameworks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-atlass--model.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://atlass-model.vercel.app)
[![JavaScript](https://img.shields.io/badge/Vanilla%20JS-ES%20Modules-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![TMDb](https://img.shields.io/badge/Powered%20by-TMDb%20API-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![MovieLens](https://img.shields.io/badge/Dataset-MovieLens%20ml--latest--small-10b981?style=for-the-badge)](https://grouplens.org/datasets/movielens/)
[![WebGL](https://img.shields.io/badge/Gallery-WebGL%20%2B%20OGL-a855f7?style=for-the-badge)](https://github.com/oframe/ogl)
[![License](https://img.shields.io/badge/License-Educational-f59e0b?style=for-the-badge)](#license--attributions)

<br />

![ATLASS UI Preview](modal.png)

</div>

---

## 📖 Table of Contents

- [What is ATLASS?](#-what-is-atlass)
- [By the Numbers](#-by-the-numbers)
- [System Architecture](#-system-architecture)
- [Dual-Mode Data Pipeline](#-dual-mode-data-pipeline)
- [The Recommendation Engine](#-the-recommendation-engine)
  - [Offline: Hybrid SVD + Content Model](#offline-mode-hybrid-svd--content-based-filtering)
  - [The Mathematics](#the-mathematics)
  - [Live TMDb Mode](#live-tmdb-mode)
  - [Match Score Runtime Boosts](#match-score-runtime-boosts)
- [UI System Architecture](#-ui-system-architecture)
  - [Card Hover Expand System](#card-hover-expand-system)
  - [Infinite Scroll Engine](#infinite-scroll-engine)
  - [Dynamic Glow Extraction](#dynamic-glow-extraction)
- [Onboarding & Preference Learning](#-onboarding--preference-learning)
  - [The Swipe Feedback Loop](#the-swipe-feedback-loop)
- [State Management & Persistence](#-state-management--persistence)
- [WebGL Circular Gallery — Roulette of Fate](#-webgl-circular-gallery--roulette-of-fate)
  - [The Bend Formula](#the-bend-formula)
  - [Audio Synthesis](#audio-synthesis)
  - [Shader Highlights](#shader-highlights)
- [Project Structure](#-project-structure)
- [Module Dependency Graph](#module-dependency-graph)
- [Tech Stack](#-tech-stack)
- [Running Locally](#-running-locally)
- [API Key Setup](#-api-key-setup)
- [Browser Compatibility](#-browser-compatibility)
- [License & Attributions](#-license--attributions)

---

## 🎬 What is ATLASS?

**ATLASS** is not just a movie recommender — it is a fully realized, browser-native cinematic experience that fuses machine learning with a handcrafted design system. At its core lies a dual-pipeline architecture: an offline hybrid recommendation engine trained on the **MovieLens ml-latest-small** dataset, and a live integration with the **TMDb API** that pulls real-time posters, trailers, cast data, and streaming availability. Whichever mode is active, the experience feels continuous and premium.

What makes ATLASS genuinely unusual is what it chose *not* to use. There is no React, no Vue, no component library, no build step, and no bundler. The entire application — recommendation engine, WebGL roulette, onboarding swipe deck, modal system, infinite scroll, platform browser, and a ~4,000-line CSS design system — runs as native ES modules loaded directly in the browser. The aesthetic borrows from Netflix's density, A24's editorial restraint, and high-end magazine typography. It is, from first principles to final pixel, built from scratch.

### What ATLASS does for you

When you first open the app, a taste-learning onboarding flow greets you — genre pills, language preferences, and a swipeable movie deck that feels like Tinder for cinema. Every swipe right seeds a growing queue of similar films. Every swipe left trains ATLASS to exclude patterns you dislike. By the time you reach the main interface, ATLASS already knows your taste well enough to populate 17 personalized rows with a globally deduplicated feed.

From that point, each rating you give — one to five stars — folds directly into the recommendation model, refining your latent taste profile in real time without any server round-trip.

---

## 📊 By the Numbers

| Metric | Value |
|--------|-------|
| Movies in dataset | 9,742 |
| User rating vectors | 610 |
| Total ratings | 100,836 |
| SVD latent factors | 32 |
| Content vector dimensions | 48 (LSA) |
| Collaborative / Content blend | α = 0.70 / 0.30 |
| CSS lines | ~4,000 |
| Core UI logic | ~2,500 lines |
| Framework dependencies | **Zero** |
| Build step | **None** |
| Personalized home rows | 17 |

---

## 🏗 System Architecture

The entire application is orchestrated from `app.js`, which boots a chain of initialization: reactive state, API-key detection, the recommendation engine, the UI layer, the WebGL gallery, and finally the onboarding flow. Every module communicates through the shared `state` object — there is no event bus, no context provider, no store. Just one carefully managed JavaScript object and the browser's `localStorage`.

```mermaid
graph TB
    subgraph "🌐 Browser Runtime"
        A["index.html\nSingle-page shell"]
        B["app.js\nEntry point & orchestration"]
        C["state.js\nGlobal reactive state"]
        D["config.js\nRuntime constants & API key"]
    end

    subgraph "🧠 Recommendation Engine"
        E["recommender.js\nOrchestrator"]
        F{"Mode Selector\nTMDB_API_KEY present?"}
        G["Live Mode\nTMDb /recommendations"]
        H["Offline Mode\nMovieLens + SVD"]
        I["ml-model.js\nHybrid SVD + Content"]
        J["data/model.json\nPre-trained SVD (k=32)"]
        K["data/content_model.json\nPre-trained Content (dim=48)"]
    end

    subgraph "🎨 UI Layer"
        L["ui.js\nCore rendering engine"]
        M["buildCard & Card System\nHover expand, quick actions"]
        N["Infinite Scroll Engine\nBuffer clone + scroll compensation"]
        O["Modal & Popup System\nDetail view, ratings, trailers"]
        P["Platform Browser\nNetflix, Prime, Disney+…"]
        Q["Hero + Trending + Search"]
    end

    subgraph "🔮 Specialized Components"
        R["CircularGallery.js\nWebGL OGL roulette"]
        S["PillNav.js\nGSAP animated navigation"]
        T["onboarding.js\nTaste learning flow"]
    end

    subgraph "💾 Persistence"
        U["localStorage\nWatchlist, ratings, auth, theme, onboarding"]
        V["data/ml-latest-small/\nmovies.csv, ratings.csv, links.csv"]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    E --> F
    F -->|"Key present"| G
    F -->|"No key / file://"| H
    H --> I
    I --> J
    I --> K
    E --> L
    L --> M
    L --> N
    L --> O
    L --> P
    L --> Q
    B --> R
    B --> S
    B --> T
    C --> U
    T --> U
```

---

## 🔀 Dual-Mode Data Pipeline

ATLASS selects its operating mode automatically at startup, based on whether a TMDb API key is present in `localStorage`. The switch is invisible to the user — both modes surface the same UI structure — but the data path, poster fidelity, and recommendation strategy differ meaningfully.

```mermaid
flowchart LR
    subgraph "🔴 LIVE MODE — API key configured"
        direction TB
        A1["User Opens App"] --> B1["Detect TMDB_API_KEY\nin localStorage"]
        B1 --> C1["Fetch /movie/{seed}/recommendations\nup to 3 seeds from watchlist + onboarding"]
        C1 --> D1["Interleave & Deduplicate\nRound-robin merge, Set-based dedup"]
        D1 --> E1["Filter & Score\nOnboarding genres/languages + popularity weighting"]
        E1 --> F1["Backfill if needed\n/discover/movie with genre/lang filters"]
        F1 --> G1["Render 20 cards\nReal TMDb posters, metadata, trailers"]
    end

    subgraph "🔵 OFFLINE MODE — No API key"
        direction TB
        A2["User Opens App"] --> B2["Load MovieLens CSVs\nfetch(data/ml-latest-small/*.csv)"]
        B2 --> C2["Parse & Map\nmovies.csv + links.csv → TMDb ID mapping"]
        C2 --> D2["Parse ratings.csv\n100,836 ratings, 610 users"]
        D2 --> E2["Load Pre-trained Models\nmodel.json (SVD) + content_model.json"]
        E2 --> F2["Warm up ml-model.js\nLoad into memory, create idxOf Map"]
        F2 --> G2["Fold-in user ratings\nProject user → latent space"]
        G2 --> H2["Compute hybrid scores\nα=0.7 SVD + 0.3 Content → top 10"]
        H2 --> I2["Render cards\nUnsplash placeholder images, fallback metadata"]
    end

    style A1 fill:#fef3c7,stroke:#f59e0b,color:#000
    style A2 fill:#dbeafe,stroke:#3b82f6,color:#000
```

### Mode Comparison

| Scenario | Mode | Posters | Metadata | Recommendation Source |
|----------|------|---------|----------|----------------------|
| API key in localStorage | Live TMDb | Real TMDb posters | Full credits, trailers, providers | TMDb `/recommendations` endpoint |
| No API key, served via HTTP | Offline MovieLens | Unsplash placeholders | CSV-derived + ML predictions | SVD + Content hybrid |
| `file://` protocol | CORS-blocked | Unsplash placeholders | Fallback only | `DEFAULT_RECS` constant |

---

## 🧠 The Recommendation Engine

The engine is the intellectual core of ATLASS. It is not a wrapper around a hosted ML service — it is a real inference pipeline running entirely inside the browser, using pre-trained weight matrices fetched from JSON files and a fold-in algorithm that projects your ratings into a latent space without retraining the model.

### Offline Mode: Hybrid SVD + Content-Based Filtering

Every time you rate a movie, the recommender re-runs immediately. Your ratings are projected into the SVD latent space, a separate content profile is built from movies you enjoyed, and the two scores are blended with a configurable α. The full sequence is illustrated below.

```mermaid
sequenceDiagram
    participant User
    participant State as state.js
    participant Rec as recommender.js
    participant ML as ml-model.js
    participant SVD as SVD Model (k=32)
    participant Content as Content Model (dim=48)
    participant UI as ui.js

    User->>State: Rate movie 1–5 stars
    State->>State: localStorage.user_movie_ratings
    State->>Rec: initializeRecommender()
    Rec->>ML: loadModel()
    ML->>SVD: Fetch model.json\nk, globalMean, item_factors[9724×32], popularity
    ML->>Content: Fetch content_model.json\ndim, vectors[movieId→48d]
    ML-->>Rec: Ready
    Rec->>ML: getRecommendations(userRatings, topN=10)
    ML->>ML: getScoreMap(userRatings)

    Note over ML,SVD: Stage 1 — Collaborative SVD Fold-In
    ML->>SVD: foldIn(userRatings)
    SVD->>SVD: for each rated movie:\ndev = rating - 3.5016\nweight = |dev| + 1e-6\nvec[d] += factor[idx][d] × dev\nwsum += weight
    SVD-->>ML: userVec (32-d normalized)

    Note over ML,Content: Stage 2 — Content Profile
    ML->>Content: buildContentProfile(userRatings)
    Content->>Content: for each rating ≥ 3.5:\naccumulate vector[mid]\ncount++
    Content-->>ML: userProfile (48-d, L2 normalized)

    Note over ML,SVD: Stage 3 — Score All Unseen Movies
    ML->>SVD: loop over item_factors[i]:\nsvdScore = dot(item_factors[i], userVec)
    ML->>Content: if profile exists:\ncontentScore = dot(contentVec[mid], profile)
    ML->>ML: finalScore = 0.70 × svdScore + 0.30 × contentScore

    ML-->>Rec: sorted movieIds + scoreMap
    Rec-->>UI: Render "Top Picks For You"
    UI->>UI: calculateMatchScore(movieId)
    Note over UI: clamp(75 + (score / 5.0) × 24, 75, 99)
    UI-->>User: Movie cards with % match badges
```

### The Mathematics

#### SVD Fold-In

When a new user arrives, the model cannot retrain — the SVD decomposition was computed offline. Instead, ATLASS uses the **fold-in technique**: it projects the user's known ratings into the latent space defined by the pre-trained item factors. The user vector is a weighted average of item factor vectors, where each weight is the deviation of the rating from the global mean:

$$\vec{u} = \frac{\sum_{i \in R_u} \bigl(\vec{v}_i \cdot (r_{ui} - \mu)\bigr) \cdot |r_{ui} - \mu|}{\sum_{i \in R_u} |r_{ui} - \mu|}$$

Where:
- $\vec{v}_i$ is the item factor vector for movie $i$ — a 32-dimensional embedding learned during offline SVD decomposition
- $r_{ui}$ is the rating that user $u$ gave to movie $i$
- $\mu = 3.5016$ is the global mean rating across all 100,836 ratings in the MovieLens corpus
- $R_u$ is the set of movies rated by user $u$

Ratings above the mean pull the user vector *toward* that item's direction; ratings below push it *away*. The magnitude of the deviation determines how strongly each rating influences the final position.

#### Content Profile

In parallel, ATLASS builds a content-based user profile from the subset of movies the user rated at 3.5 stars or above. It averages their 48-dimensional LSA content vectors and L2-normalizes the result so that directional similarity, not magnitude, drives scoring:

$$\vec{p}_u = \frac{\sum_{i \in R_u^+} \vec{c}_i}{\left\|\sum_{i \in R_u^+} \vec{c}_i\right\|_2}$$

Where $\vec{c}_i$ is the 48-dimensional content embedding for movie $i$, derived offline from TF-IDF on Wikipedia plot text followed by Latent Semantic Analysis dimensionality reduction.

#### Hybrid Blend

The final score for any unseen movie $m$ is a linear interpolation between the collaborative signal (how strongly the latent space predicts this movie for this user) and the content signal (how closely the movie's semantic content matches the user's liked-movie profile):

$$\text{score}(m, u) = \alpha \cdot \underbrace{(\vec{v}_m \cdot \vec{u})}_{\text{SVD score}} + (1-\alpha) \cdot \underbrace{(\vec{c}_m \cdot \vec{p}_u)}_{\text{Content score}}$$

With $\alpha = 0.70$ as the default — configurable in `ml-model.js:8`. The higher weight on SVD reflects the empirical strength of collaborative signals when sufficient rating data exists; the 30% content contribution ensures the system still surfaces thematically coherent films even when the user's latent profile is sparse.

#### Match % Badge

Raw model scores are mapped to a human-readable confidence percentage displayed on each card. The mapping is clamped to a range of 75–99% to avoid the psychological noise of low numbers while preserving meaningful relative ranking:

$$\text{match\%} = \text{clamp}\!\left(75 + \frac{\text{score}}{5.0} \times 24,\ 75,\ 99\right)$$

### Live TMDb Mode

When an API key is present, the collaborative model is replaced by TMDb's own recommendation endpoint. The process is:

1. **Seed selection** — up to 3 movies drawn from `watchlist ∪ onboardingLikes` (randomized to vary results across sessions)
2. **Parallel fetch** — `Promise.all([/movie/{s1}/recommendations, /movie/{s2}/recommendations, /movie/{s3}/recommendations])`
3. **Round-robin interleave** — results from all three sources are merged so no single seed dominates
4. **Set-based deduplication** — first-seen wins; subsequent duplicates are discarded
5. **Filter** — exclude onboarding dislikes, unreleased movies, and language/genre mismatches
6. **Score** — `matchingGenres × 100 + popularity / 1000`
7. **Backfill** — if fewer than 20 recommendations survive, `/discover/movie` is queried with onboarding genre and language filters

### Match Score Runtime Boosts

User preferences from the Settings panel layer additional boosts on top of the model score at render time, without touching the underlying model:

```javascript
// Each matching genre → +4%
favGenres.forEach(fg => {
    if (movieGenres.includes(fg.toLowerCase())) score += 4;
});

// Preferred streaming platform match → +5%
if (hasFavProvider) score += 5;

// Hard ceiling
score = Math.min(99, Math.max(0, score));
```

---

## 🎨 UI System Architecture

The UI is a single `ui.js` module of over 2,500 lines. It contains the card builder, the infinite scroll engine, the modal system, the hover popup, the home section orchestrator, the platform browser, the search panel, and the hero section. Every piece is built on vanilla DOM APIs — no shadow DOM, no virtual DOM, no diffing.

```mermaid
graph TD
    subgraph "🎬 Card System"
        A["buildCard(movieId, initialData?)"] --> B["Create card DOM\nposter, match badge, quick-add btn"]
        B --> C["Async fetchTMDBDetails()\nresolves poster, metadata, cast"]
        C --> D["Dynamic Glow Extraction\ngenre-based CSS --glow-color"]
        B --> E["Hover: schedulePopup() → 500ms delay"]
        B --> F["Click: openModal() → detail view"]
    end

    subgraph "♾️ Infinite Scroll Engine"
        G["Snapshot original children"] --> H["Prepend 3 batch copies"]
        H --> I["Append 3 batch copies"]
        I --> J["Calculate batchWidth"]
        J --> K["Scroll to batchWidth × 3\nstart at middle of buffer"]
        K --> L["Scroll listener (passive)"]
        L --> M{"requestAnimationFrame tick"}
        M --> N{"scrollLeft + clientWidth\n≥ scrollWidth - threshold?"}
        N -->|Yes| O["appendBatch()\nclone snapshot, rewire events"]
        N -->|No| P{"scrollLeft ≤ threshold?"}
        P -->|Yes| Q["prependBatch() + compensate\nmeasure scrollWidth delta,\nscrollLeft += added width\n→ ZERO visual jump"]
    end

    subgraph "🎭 Modal System"
        R["openModal(movie)"] --> S["Hash routing\nwindow.location.hash = #movie-{id}"]
        S --> T["Full-bleed backdrop + poster\nblur fallback if no backdrop"]
        T --> U["Stats grid: Rating, Runtime,\nGenre, Streaming platforms"]
        U --> V["YouTube trailer embed\nfrom TMDb /videos endpoint"]
        V --> W["5-star user rating\npersisted to localStorage"]
        W --> X["AI reasoning pills\nWhy ATLASS picked this"]
        X --> Y["Cast & Director grid\nprofile photos from TMDb"]
        Y --> Z["Not Interested action\nadds to onboarding dislikes"]
    end

    subgraph "🏠 Home Sections"
        AG["renderHomeSections()"] --> AH["17 personalized rows"]
        AH --> AI["Cross-section deduplication\nglobalSeenIds Set"]
        AI --> AJ["TMDB mode: 17 distinct endpoints\nnow_playing, discover, trending, popular…"]
        AI --> AK["Offline mode: Hand-curated TMDb IDs\n16 genre-accurate lists with dedup"]
    end
```

### Card Hover Expand System

The Netflix-style hover popup uses a **delayed expansion** pattern to avoid accidental triggers during fast scroll. A 500ms timer starts on `mouseenter`; if the pointer leaves before it fires, the popup is cancelled cleanly with no DOM changes.

```mermaid
flowchart LR
    A["mouseenter"] --> B["schedulePopup()\nsetTimeout 500ms"]
    B --> C{"mouseleave before 500ms?"}
    C -->|Yes| D["cancelPopup()\nclearTimeout"]
    C -->|No| E["showPopup()\n_buildExpandPanel()"]
    E --> F["Attach to cardEl\nPopulate from movie object"]
    F --> G["Viewport clamp\nexpand-left / expand-right"]
    G --> H["card-is-expanded\nCSS transition morph"]
    H --> I["Panel onmouseenter\n→ keep alive"]
    I --> J["Panel onmouseleave\n→ hidePopup()"]
```

### Infinite Scroll Engine

True infinite scroll — not pagination, not lazy loading — is achieved by maintaining a circular buffer of DOM clones. The engine prepends and appends batches of cloned cards as the user scrolls, compensating for the scroll position change that prepending would otherwise cause, resulting in zero visual jump in either direction.

### Dynamic Glow Extraction

Each card gets a CSS custom property `--glow-color` derived from its primary genre at render time. This drives the card's border glow and the ambient light effect on hover without any runtime color computation — just a class look-up mapped to pre-defined palette tokens.

| Genre | Glow Color | Token |
|-------|------------|-------|
| Sci-Fi | Indigo `#818cf8` | `rgba(129,140,248,0.5)` |
| Action | Red `#ef4444` | `rgba(239,68,68,0.5)` |
| Comedy | Emerald `#34d399` | `rgba(52,211,153,0.5)` |
| Drama | Amber `#f59e0b` | `rgba(245,158,11,0.5)` |
| Horror | Purple `#a855f7` | `rgba(168,85,247,0.5)` |
| Romance | Pink `#f472b6` | `rgba(244,114,182,0.5)` |
| Thriller | Orange `#fb923c` | `rgba(251,146,60,0.5)` |
| Default | Violet `#a78bfa` | `rgba(167,139,250,0.5)` |

---

## 🧭 Onboarding & Preference Learning

The onboarding flow is the system's first opportunity to learn. It is a three-step sequence — taste selection, swipe feedback, and profile completion — that runs before the main app renders, ensuring that even a first-time user arrives at a personalized feed rather than a generic one.

```mermaid
flowchart TD
    A["User Logs In\nstate.isLoggedIn = true"] --> B{"swipe_onboarding_completed\n= 'true' ?"}
    B -->|"No"| C["Show Onboarding Overlay\nHides navbar + main content"]
    B -->|"Yes"| D["Load Main App\nnavbar, hero, rows, all sections"]

    subgraph "Step 1: Taste Selection"
        E["Genre Pills\n39 genres, multi-select\n'Load More' shows 4 more each click"]
        F["Language Pills\n26 languages, multi-select"]
        G["Talent Search\nAutocomplete from TMDb /search/person\nOffline fallback: MOVIES cast matching"]
    end

    C --> E
    E --> F
    F --> G

    subgraph "Step 2: Swipe Feedback"
        H["submitOnboardingPreferences()"]
        H --> I["Fetch TMDB /discover/movie\nwith selected genres, languages, people"]
        I --> J["Render 3-Card Stack\nstaggered scale (1, 0.96, 0.92)\nopacity (1, 0.85, 0.7)"]
        J --> K["Drag Gestures\nmouse + touch support\nrotation = offsetX × 0.08"]
        K --> L{"threshold > 120px?"}
        L -->|"Swipe Right 👍"| M["throwCard('right')\n→ add to swipedLikes\n→ fetch /recommendations for more"]
        L -->|"Swipe Left 👎"| N["throwCard('left')\n→ add to swipedDislikes"]
        L -->|"Swipe Up ⏭"| O["throwCard('up')\n→ skip"]
        L -->|"Below threshold"| P["Snap back to center"]
        M --> Q["shift() from swipeQueue"]
        N --> Q
        O --> Q
        Q --> R["renderNextDeckCards()"]
    end

    subgraph "Step 3: Profile Completion"
        S["swipedLikes ≥ 10?"] -->|Yes| T["completeOnboarding()"]
        T --> U["Calculate excludedGenres\ngenreDislikesCount > genreLikesCount → exclude"]
        U --> V["Save to localStorage:\nonboarding_genres, _languages,\n_talents, _likes, _dislikes,\n_excluded_genres"]
        V --> W["Show 'Curating…' loading view\n4 status messages, 600ms each"]
        W --> X["Call renderHomeSections()\n→ personalized 17-row feed"]
        X --> Y["Hide overlay → show full app"]
    end

    R --> S
    S -->|No| J

    style A fill:#fef3c7,stroke:#f59e0b,color:#000
    style Y fill:#d1fae5,stroke:#10b981,color:#000
```

### The Swipe Feedback Loop

The most interesting aspect of onboarding is that it doesn't stop learning once you start swiping. Every right-swipe immediately triggers a fetch for similar movies, dynamically expanding the queue without ever running out of content. The loop is tight and intentional:

```mermaid
flowchart LR
    A["Swipe Right on Movie M"] --> B["Add M to swipedLikes"]
    B --> C["Mark M as 'watched'\nlocalStorage.user_movie_ratings"]
    C --> D{"TMDB API Key present?"}
    D -->|Yes| E["Fetch /movie/{M.id}/recommendations"]
    D -->|No| F["Find MOVIES matching M's genres"]
    E --> G["Filter: unseen, not disliked, released"]
    F --> G
    G --> H["Append ≤5 to swipeQueue"]
    H --> I["Dynamic queue grows as you swipe"]
    I --> J["More data → better recommendations"]
```

Every swipe right immediately enriches the recommendation pool with similar movies, creating a tight feedback loop that adapts to taste in real time. By the time onboarding completes, ATLASS has gathered enough signal to distinguish between, say, someone who likes *cerebral* sci-fi versus someone who prefers *action* sci-fi — even though both swiped right on the same genre.

---

## 💾 State Management & Persistence

ATLASS has no Redux, no Zustand, no reactive store. State is a plain JavaScript object that every module imports and mutates directly. Persistence is handled by a small set of helper functions that serialize state to `localStorage` on every meaningful change. The architecture is intentionally minimal — and surprisingly effective.

```mermaid
classDiagram
    class State {
        +tmdbCache: Map(id, Movie)
        +watchlist: Movie[]
        +watchlistToRestore: number[]
        +currentModalMovie: Movie
        +currentHeroMovie: Movie
        +currentSurpriseMovie: Movie
        +spinLock: boolean
        +activePlatform: string
        +activeType: string
        +personalizedRecommendations: Map(id, score)
        +movieLensData: object
        +isLoggedIn: boolean
        +user: object | null
    }

    class LocalStorageKeys {
        <<enumeration>>
        +user_watchlist
        +user_watchlist_to_restore
        +user_auth
        +user_movie_ratings
        +tmdb_api_key
        +theme
        +fav_genres
        +fav_providers
        +confetti_enabled
        +roulette_bend
        +swipe_onboarding_completed
        +onboarding_genres
        +onboarding_languages
        +onboarding_talents
        +onboarding_likes
        +onboarding_dislikes
        +onboarding_excluded_genres
    }

    class Persistence {
        +saveWatchlistToStorage()
        +loadWatchlistFromStorage()
        +saveAuthState()
        +loadAuthState()
    }

    State --> Persistence : calls
    Persistence --> LocalStorageKeys : reads/writes
    State ..> Persistence : reactive sync
```

### Reactive Sync Pattern

Every mutation to the watchlist triggers a synchronous cascade that keeps the entire UI consistent — badge counts, card quick-add buttons, platform rows, the hero section, and the recommendation engine all update from a single source of truth:

```mermaid
flowchart LR
    A["User Action"] --> B["state.watchlist.push(movie)"]
    B --> C["saveWatchlistToStorage()\nJSON.stringify → localStorage"]
    C --> D["updateWatchlistUI()\nRebuild wl-strip DOM"]
    D --> E["updateWLCount()\nBadge + nav badge"]
    E --> F["syncWatchlistButtons()\nCard quick-adds, trending,\nplatform, hero, modal"]
    F --> G["initializeRecommender()\nif movieLensData.loaded"]
```

### localStorage Schema

| Key | Format | Example |
|-----|--------|---------|
| `user_watchlist` | `Movie[]` | `[{id:1, title:"Dune: Part Two", …}]` |
| `user_movie_ratings` | `{movieId: rating}` | `{"968051": 4.5, "872585": 5}` |
| `user_auth` | `{isLoggedIn, user}` | `{"isLoggedIn":true,"user":{"name":"Pranav"}}` |
| `tmdb_api_key` | `string` | `"572a69a7..."` |
| `onboarding_genres` | `number[]` | `[28, 18, 878]` |
| `fav_genres` | `string[]` | `["Action", "Drama"]` |
| `fav_providers` | `string[]` | `["netflix", "max"]` |
| `roulette_bend` | `string` | `"3.0"` |
| `confetti_enabled` | `string` | `"true"` |

---

## 🎡 WebGL Circular Gallery — Roulette of Fate

The Roulette of Fate is the most technically adventurous component in ATLASS. It is a WebGL-powered `CircularGallery` — ported and extensively customized from the React Bits OGL component — that renders your watchlist as 3D-curved poster cards on a mathematical arc. When you spin it, the gallery accelerates to a programmatically pre-chosen target index while synthesized sound effects play, then decelerates, snaps, and reveals "Tonight's Pick" with a golden border glow and a confetti burst.

```mermaid
flowchart LR
    subgraph "🔄 Gallery Initialization"
        A["initPickGallery()"] --> B["Destroy previous instance\npickGalleryApp.destroy()"]
        B --> C{"watchlist.length"}
        C -->|0| D["Show empty message"]
        C -->|1| E["Show 'Add 2+ movies' lock"]
        C -->|"≥2"| F["Map watchlist to gallery items\nposter → weserv.nl proxy"]
        F --> G["Load OGL from CDN\nimport(ogl@1.0.11/+esm)"]
        G --> H["Create Renderer\nalpha=true, antialias, dpr=min(dpr,2)"]
        H --> I["Create Camera\nfov=45, position.z=20"]
        I --> J["Create Scene\nOGL.Transform root"]
        J --> K["Create PlaneGeometry\n100×50 segments for smooth bend"]
        K --> L["Create Media items\nshader + mesh + title per movie"]
        L --> M["onResize → fit container"]
        M --> N["Start render loop\nrequestAnimationFrame"]
    end

    subgraph "🎯 Spin Mechanics"
        O["rollPickMovie()"] --> P["Set isSpinning = true"]
        P --> Q["Reset all uWinningTarget to 0"]
        Q --> R["Pick random winner index"]
        R --> S["Calculate target:\ncurrentIndex + 4×N + offset"]
        S --> T["Set scroll.target = targetIndex × width"]
        T --> U["Set scroll.ease = 0.04\nfaster deceleration"]
        U --> V["Animation loop detects settle\n|target - current| < 0.15"]
        V --> W["onSpinEnd callback"]
        W --> X["Highlight winning card\nuWinningTarget = 1.0 (gold glow)"]
        X --> Y["Show 'Tonight's Pick' result"]
        Y --> Z["confettiBurst()\n75 particles, HSL colors"]
    end

    N --> O
```

### The Bend Formula

The gallery's characteristic curve is computed per-frame using a circular arc formula. Each card's position on screen is mapped to a point on a circle whose radius is derived from the bend intensity setting:

```mermaid
flowchart LR
    AA["screen: {width, height}"] --> AB["viewport: {width, height}\nderived from fov + camera.z"]
    AB --> AC["scale = screen.height / 1500"]
    AC --> AD["baseScaleY = viewport.height × (900 × scale) / screen.height"]
    AD --> AE["baseScaleX = viewport.width × (700 × scale) / screen.width"]
    AE --> AF["x = (index × width) - scroll.current - extra"]
    AF --> AG{"bend ≠ 0?"}
    AG -->|Yes| AH["B = |bend|\nH = viewport.width / 2\nR = (H² + B²) / 2B"]
    AH --> AI["eX = min(|x|, H)\narc = R - sqrt(R² - eX²)"]
    AI --> AJ["bend > 0: y = -arc, rotation = -sign(x) × asin(eX/R)\nbend < 0: y = arc, rotation = sign(x) × asin(eX/R)"]
    AG -->|No| AK["y = 0, rotation = 0"]
```

The radius $R$ of the underlying circle is computed from the bend magnitude $B$ and the half-viewport width $H$:

$$R = \frac{H^2 + B^2}{2B}$$

Each card at screen-x offset $x$ then sits at arc height:

$$\text{arc} = R - \sqrt{R^2 - \min(|x|,\, H)^2}$$

The bend curvature (0.0–5.0) is user-configurable in Settings and persisted to `localStorage` as `roulette_bend`.

### Audio Synthesis

The spin sequence is scored entirely with the Web Audio API — no audio files, no samples. All sounds are synthesized from oscillators and noise at runtime:

| Sound | Synthesis | Character |
|-------|-----------|-----------|
| `playTick()` | Square wave 880→440 Hz, 60 ms | Card click feedback |
| `playSpinAccel()` | Sawtooth 110→440 Hz, 1.2 s | Gallery acceleration |
| `playWhoosh()` | Bandpass noise, 1.5 s | Momentum blur |
| `playWin()` | C5-E5-G5-C6 arpeggio, triangle | Win fanfare |
| `playClick()` | Triangle 600→300 Hz, 40 ms | UI interactions |

### Shader Highlights

The GLSL fragment shader in `CircularGallery.js` handles rounded-corner masking via a signed-distance function, image aspect-fill correction, and the winning-card gold glow — all in a single pass:

```glsl
// SDF-based rounded corners
float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
vec4 finalColor = vec4(color.rgb, alpha);

// Winning card: outer gold glow + inner highlight
if (d > 0.0) {
    float glow = smoothstep(0.06, 0.0, d);
    finalColor = vec4(vec3(0.96, 0.62, 0.04), glow * uWinning);
} else {
    float innerGlow = smoothstep(-0.03, 0.0, d);
    finalColor.rgb = mix(finalColor.rgb, vec3(0.96, 0.62, 0.04),
                         innerGlow * uWinning * 0.55);
}
```

---

## 📁 Project Structure

```
atlass/
├── index.html                  # Single-page shell — all sections, modals, overlays
├── style.css                   # ~4,000 lines of CSS, custom properties, dark/light themes
├── app.js                      # Entry point — orchestrates init sequence (72 lines)
├── state.js                    # Shared reactive state + localStorage helpers (67 lines)
├── config.js                   # TMDb API key, protocol detection, default rec IDs
├── recommender.js              # Recommendation orchestrator + MovieLens CSV loader (373 lines)
├── ml-model.js                 # Hybrid SVD + Content model inference engine (142 lines)
├── ui.js                       # Core UI engine — cards, rows, modals, popups, platforms (2,500+ lines)
├── CircularGallery.js          # WebGL OGL-based 3D circular gallery / Roulette (311 lines)
├── PillNav.js                  # GSAP-powered animated pill navigation (86 lines)
├── onboarding.js               # Taste learning flow — genre/lang selection + swipe (742 lines)
├── data.js                     # 12-movie fallback dataset with full metadata (121 lines)
├── screenshot.py               # Utility for generating UI screenshots
├── modal.png                   # UI preview screenshot
├── logo.jpg                    # App logo
└── data/
    ├── model.json              # Pre-trained SVD model (k=32, ~500 KB)
    ├── content_model.json      # Pre-trained content model (dim=48, ~200 KB)
    └── ml-latest-small/        # MovieLens ml-latest-small dataset (GroupLens)
        ├── movies.csv          # 9,742 movies with titles and genres
        ├── ratings.csv         # 100,836 ratings from 610 users
        ├── links.csv           # MovieLens → TMDb / IMDb ID mapping
        └── tags.csv            # User-applied tags
```

### Module Dependency Graph

```mermaid
graph LR
    A["app.js"] --> B["state.js"]
    A --> C["config.js"]
    A --> D["recommender.js"]
    A --> E["ui.js"]
    A --> F["PillNav.js"]
    A --> G["onboarding.js"]

    D --> B
    D --> C
    D --> E
    D --> H["ml-model.js"]

    E --> B
    E --> C
    E --> I["data.js"]
    E --> D
    E --> J["CircularGallery.js"]

    G --> B
    G --> C
    G --> I
    G --> E

    H --> K["data/model.json"]
    H --> L["data/content_model.json"]

    D --> M["data/ml-latest-small/*.csv"]

    style A fill:#fbbf24,stroke:#d97706,color:#000
    style D fill:#60a5fa,stroke:#2563eb,color:#000
    style E fill:#f87171,stroke:#dc2626,color:#000
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Language** | Vanilla JavaScript (ES Modules) | Zero build step — runs directly in the browser |
| **Rendering** | DOM + WebGL via [OGL](https://github.com/oframe/ogl) | DOM for UI; WebGL for the 3D curved gallery |
| **Collaborative Model** | SVD (32 latent factors), pre-trained offline | Fold-in enables personalization at runtime without retraining |
| **Content Model** | TF-IDF + LSA (48-dim) | Latent semantic analysis on Wikipedia plot text |
| **Dataset** | [MovieLens ml-latest-small](https://grouplens.org/datasets/movielens/) | 9,742 movies, 100,836 ratings, 610 users |
| **Live Data** | [TMDb API v3](https://developer.themoviedb.org/docs) | Posters, trailers, cast, streaming providers |
| **Fonts** | Syne (headings) + DM Sans (body) via Google Fonts | Editorial magazine aesthetic |
| **Icons** | Font Awesome 6 | Consistent icon system |
| **Animation** | CSS keyframes + GSAP + Web Audio API | Pill nav, surprise orb, WebGL spin sound FX |
| **State** | Single shared `state` object + `localStorage` | No Redux, no reactivity library needed |
| **Build** | **None** | ES modules via `<script type="module">` |

---

## 🚀 Running Locally

The app ships with a pre-configured TMDb API key in `config.js`, so it works out of the box from any local web server.

### Prerequisites

No Node.js required. No `npm install`. Just a web server.

### Start a Server

```bash
# Python 3 (recommended — zero dependencies)
python -m http.server 8080

# Node.js
npx serve .

# Then open:
http://localhost:8080
```

> **⚠️ Important:** Do **not** open `index.html` directly via `file://`. The browser's CORS policy blocks `fetch()` calls to local CSV files and the TMDb API. Always serve through a local web server.

---

## 🔑 API Key Setup

The bundled key works immediately, but you can substitute your own for higher rate limits:

1. Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Open the app → click the avatar (top-right) → **Settings** → **API** tab
3. Paste your key and click **Test**
4. A green indicator confirms the connection; the page reloads with live data

### Offline Mode Fallbacks

If no API key is present or if it is cleared, ATLASS degrades gracefully:

| Feature | Fallback |
|---------|----------|
| Movie metadata | MovieLens CSV data |
| Posters | Unsplash placeholder images |
| Match scores | Deterministic hash: `85 + ((movieId × 7) % 15)` |
| Recommendations | SVD + Content hybrid model |
| Trending | Curated MovieLens IDs |
| Platform Browser | Cached platform data (6 movies/series per platform) |

---

## 🌐 Browser Compatibility

| Feature | Minimum Requirement |
|---------|---------------------|
| ES Modules | Chrome 61+, Firefox 60+, Safari 10.1+ |
| WebGL (CircularGallery) | Any GPU-accelerated browser |
| Web Audio API (sound FX) | Chrome, Firefox, Safari |
| CSS Custom Properties | All modern browsers |
| `fetch()` (CSV loading) | Chrome 42+, Firefox 39+, Safari 10.1+ |
| `IntersectionObserver` | Chrome 58+, Firefox 55+, Safari 15.4+ |
| `ResizeObserver` | Chrome 64+, Firefox 69+, Safari 13.1+ |

---

## 📜 License & Attributions

Built for educational and portfolio purposes.

- **MovieLens Dataset** — F. Maxwell Harper and Joseph A. Konstan. 2015. *The MovieLens Datasets: History and Context.* ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4: 1–19. Used under the [GroupLens Research License](https://grouplens.org/datasets/movielens/).
- **TMDb** — This product uses the TMDb API but is not endorsed or certified by TMDb. Data subject to [TMDb Terms of Use](https://www.themoviedb.org/documentation/api/terms-of-use).
- **OGL** — WebGL library by [oframe](https://github.com/oframe/ogl), used under MIT License.
- **GSAP** — GreenSock Animation Platform, used under the standard GreenSock license.
- **Font Awesome** — Icons used under the Font Awesome Free license.
- **Google Fonts** — Syne + DM Sans used under the Open Font License.

---

<div align="center">

Made with obsessive attention to detail by [4-thkind](https://github.com/4-thkind)

*No frameworks were harmed in the making of this project.*

</div>