<div align="center">

<img src="logo.jpg" alt="ATLASS Logo" width="100" />

# ✦ ATLASS
### *Adaptive Taste Learning And Suggestion System*

> A hybrid recommendation engine — trained on 100,836 real ratings, running live in the browser —  
> wrapped in a cinematic UI that feels like it belongs on a streaming platform.

<br/>

![ATLASS UI Preview](modal.png)

</div>

---

## 📖 Table of Contents

- [What is ATLASS?](#-what-is-atlass)
- [By the Numbers](#-by-the-numbers)
- [System Architecture](#-system-architecture)
- [Dual-Mode Data Pipeline](#-dual-mode-data-pipeline)
- [The Recommendation Engine](#-the-recommendation-engine)
  - [SVD Fold-In](#svd-fold-in)
  - [Content Profile](#content-profile)
  - [Hybrid Blend](#hybrid-blend)
  - [Match % Badge](#match--badge)
  - [Live TMDb Mode](#live-tmdb-mode)
  - [Runtime Score Boosts](#runtime-score-boosts)
- [UI System Architecture](#-ui-system-architecture)
  - [Card Hover Expand](#card-hover-expand)
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

**ATLASS** is a browser-native movie recommendation system built on a real machine learning pipeline — not a wrapper around a hosted API, and not a cosine-similarity hack over a CSV. At its core is a hybrid model trained offline on the **MovieLens ml-latest-small** corpus: 100,836 ratings from 610 users across 9,742 films. That training produces two weight matrices — a 32-dimensional SVD item-factor matrix for collaborative signals, and a 48-dimensional LSA content-vector matrix derived from TF-IDF on Wikipedia plot text. Both ship as JSON files and run inference entirely inside the browser, with zero server involvement.

When you rate a movie, ATLASS executes the **fold-in technique** in real time: it projects your ratings into the latent space the SVD already learned, building a 32-dimensional taste vector that encodes what kinds of films you genuinely respond to — not just what genres you clicked. That vector is blended 70/30 with your L2-normalized content profile, scored against every unseen film in the corpus, and surfaced as personalized rows the moment you interact with the app. No server round-trip. No retraining. Pure inference.

The interface the model drives is equally deliberate: a full streaming-platform UI with 17 personalized recommendation rows, a swipeable onboarding taste deck, a WebGL 3D curved gallery that runs your watchlist as a roulette, synthesized Web Audio sound effects, and a modal system that embeds trailers, cast grids, and streaming provider data. Every card's match percentage, every "Because You Watched" row, every ranked result — all computed by the model on your machine, in your browser.

---

## 📊 By the Numbers

| Metric | Value |
|---|---|
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

The entire application is orchestrated from `app.js`, which boots a chain of initialization: reactive state → API-key detection → recommendation engine → UI layer → WebGL gallery → onboarding flow. The ML model is the central nervous system — every personalized row, every match badge, every ranked result flows from it.

```mermaid
flowchart TD
    A[index.html\nSingle-page shell] --> B[app.js\nEntry & Orchestration]

    B --> C[state.js\nReactive State Store]
    B --> D{API Key\nPresent?}

    D -->|Yes — Live Mode| E[TMDb Endpoints\n/recommendations · /trending]
    D -->|No — Offline Mode| F[MovieLens CSVs\n9,742 movies · 100,836 ratings]

    F --> G[recommender.js\nOrchestration Layer]
    G --> H[ml-model.js\nHybrid SVD + Content Inference]

    H --> I[(model.json\nSVD k=32\n~500 KB)]
    H --> J[(content_model.json\nLSA dim=48\n~200 KB)]

    G --> K[ui.js\nCards · Rows · Modals · Popups]

    B --> K
    B --> L[CircularGallery.js\nWebGL Roulette of Fate]
    B --> M[onboarding.js\nTaste Learning Flow]
    B --> N[PillNav.js\nAnimated Navigation]

    C --> O[(localStorage\nWatchlist · Ratings · Prefs)]
    K --> O
```

---

## 🔀 Dual-Mode Data Pipeline

ATLASS selects its operating mode automatically at startup based on whether a TMDb API key is present in `localStorage`. The switch is invisible to the user — both modes surface the same UI structure — but the data path, poster fidelity, and recommendation strategy differ meaningfully.

```mermaid
flowchart TD
    START([App Startup]) --> DETECT{API Key in\nlocalStorage?}

    DETECT -->|Yes| LIVE_START[LIVE MODE]
    DETECT -->|No| OFF_START[OFFLINE MODE]

    subgraph LIVE [" 🔴  Live Mode — TMDb API Active "]
        LIVE_START --> L1[Detect API Key\nValidate credentials]
        L1 --> L2[Fetch /recommendations\nUp to 3 seed movies in parallel]
        L2 --> L3[Round-robin merge\n+ Set-based deduplication]
        L3 --> L4[Filter & Score\nGenre · Language · Popularity]
        L4 --> L5{Fewer than\n20 results?}
        L5 -->|Yes| L6[Backfill via /discover\nto meet threshold]
        L5 -->|No| L7[Render rows\nReal TMDb posters + metadata]
        L6 --> L7
    end

    subgraph OFFLINE [" 🔵  Offline Mode — ML Model Active "]
        OFF_START --> O1[Load MovieLens CSVs\n9,742 movies · 100,836 ratings]
        O1 --> O2[Parse + Map\nlinks.csv → TMDb IDs]
        O2 --> O3[Load model.json\nSVD k=32 weight matrix]
        O3 --> O4[Load content_model.json\nLSA dim=48 vectors]
        O4 --> O5[Fold-in user ratings\ninto 32-d latent space]
        O5 --> O6[Score α=0.7 SVD\n+ 0.3 Content for every unseen film]
        O6 --> O7[Render rows\nRanked by model score]
    end
```

### Mode Comparison

| Scenario | Mode | Posters | Recommendation Source |
|---|---|---|---|
| API key in `localStorage` | Live TMDb | Real TMDb posters | `/recommendations` endpoint |
| No API key, served via HTTP | Offline MovieLens | Unsplash placeholders | SVD + Content hybrid model |
| `file://` protocol | CORS-blocked | Unsplash placeholders | `DEFAULT_RECS` constant |

---

## 🧠 The Recommendation Engine

The engine is the intellectual core of ATLASS. It is not a wrapper around a hosted ML service — it is a real inference pipeline running entirely inside the browser, using pre-trained weight matrices fetched from JSON files and a fold-in algorithm that projects ratings into a latent space without ever retraining the model. Everything you see on screen — every row, every rank, every match percentage — is computed by this pipeline.

```mermaid
sequenceDiagram
    actor User
    participant State as state.js
    participant Rec as recommender.js
    participant ML as ml-model.js
    participant UI as ui.js

    User->>State: Rate movie (1–5 ★)
    State->>Rec: Trigger initializeRecommender()

    Rec->>ML: loadModel()
    ML-->>ML: Fetch model.json (SVD k=32)
    ML-->>ML: Fetch content_model.json (LSA dim=48)
    ML-->>Rec: Model ready

    Rec->>ML: getRecommendations(userRatings, topN)

    Note over ML: ── Stage 1: SVD Fold-In ──
    ML-->>ML: Compute deviation (r_ui − μ) per rated film
    ML-->>ML: Weight each item vector by deviation magnitude
    ML-->>ML: Average → 32-d user taste vector ū

    Note over ML: ── Stage 2: Content Profile ──
    ML-->>ML: Collect 48-d LSA vectors for films rated ≥ 3.5★
    ML-->>ML: Average + L2-normalize → content profile p̄

    Note over ML: ── Stage 3: Hybrid Score ──
    ML-->>ML: score(m) = 0.70 × (v̄_m · ū) + 0.30 × (c̄_m · p̄)
    ML-->>ML: Rank all unseen films descending

    ML-->>Rec: Sorted movieIds + scores
    Rec-->>UI: Inject "Top Picks For You" row

    UI-->>UI: match% = clamp(75 + score/5 × 24, 75, 99)
    UI-->>User: Cards with % confidence badges
```

### SVD Fold-In

When a new user arrives, the model cannot retrain — the SVD decomposition was computed offline on the full MovieLens corpus. Instead, ATLASS uses the **fold-in technique**: it projects the user's known ratings into the latent space defined by the pre-trained item factors. The user vector is a weighted average of item factor vectors, where each weight is the signed deviation from the global mean:

$$\vec{u} = \frac{\sum_{i \in R_u} \bigl(\vec{v}_i \cdot (r_{ui} - \mu)\bigr) \cdot |r_{ui} - \mu|}{\sum_{i \in R_u} |r_{ui} - \mu|}$$

Where $\vec{v}_i$ is the 32-dimensional item embedding for movie $i$, $r_{ui}$ is the user's rating, and $\mu = 3.5016$ is the global mean across all 100,836 ratings. Ratings above the mean pull the user vector *toward* that item's direction; ratings below push it *away*. Deviation magnitude controls influence strength.

### Content Profile

In parallel, ATLASS builds a content-based user profile from every movie rated 3.5 stars or above. It averages their 48-dimensional LSA content vectors — derived offline from TF-IDF on Wikipedia plot text — and L2-normalizes the result so that directional similarity, not magnitude, drives scoring:

$$\vec{p}_u = \frac{\sum_{i \in R_u^+} \vec{c}_i}{\left\|\sum_{i \in R_u^+} \vec{c}_i\right\|_2}$$

### Hybrid Blend

The final score for any unseen movie $m$ is a linear interpolation between the collaborative signal and the content signal:

$$\text{score}(m, u) = \underbrace{0.70 \cdot (\vec{v}_m \cdot \vec{u})}_{\text{SVD (collaborative)}} + \underbrace{0.30 \cdot (\vec{c}_m \cdot \vec{p}_u)}_{\text{Content (semantic)}}$$

The higher weight on SVD reflects the empirical strength of collaborative signals when sufficient rating data exists. The 30% content contribution ensures the system still surfaces thematically coherent films even when the user's latent profile is sparse. Both $\alpha$ values are configurable in `ml-model.js:8`.

### Match % Badge

Raw model scores are mapped to a human-readable confidence percentage. The mapping is clamped to 75–99% to avoid the psychological noise of low numbers while preserving meaningful relative ranking:

$$\text{match\%} = \text{clamp}\!\left(75 + \frac{\text{score}}{5.0} \times 24,\ 75,\ 99\right)$$

### Live TMDb Mode

When an API key is present, the collaborative model is replaced by TMDb's own recommendation endpoint:

1. **Seed selection** — up to 3 movies from `watchlist ∪ onboardingLikes` (randomized each session)
2. **Parallel fetch** — `Promise.all([/recommendations × 3 seeds])`
3. **Round-robin interleave** — no single seed dominates the result set
4. **Set-based dedup** — first-seen wins; duplicates discarded
5. **Filter** — exclude dislikes, unreleased films, language/genre mismatches
6. **Score** — `matchingGenres × 100 + popularity / 1000`
7. **Backfill** — `/discover/movie` fills any shortfall below 20 results

### Runtime Score Boosts

User preferences from Settings layer additional boosts on top of the model score at render time, without touching the underlying model:

```js
favGenres.forEach(fg => {
    if (movieGenres.includes(fg.toLowerCase())) score += 4; // +4% per matching genre
});
if (hasFavProvider) score += 5;          // +5% for matching streaming platform
score = Math.min(99, Math.max(0, score)); // hard ceiling
```

---

## 🎨 UI System Architecture

Every element on screen is a direct output of the recommendation pipeline. The card builder reads model scores; row titles reflect the signal that generated them; match badges display computed probabilities. The UI is a single `ui.js` module of over 2,500 lines — cards, infinite scroll, modal system, hover popups, platform browser, search — all wired directly to model output.

```mermaid
flowchart TD
    ML_OUT[ml-model.js\nRecommendation Scores] --> ROWS[Row Orchestrator\n17 personalized sections]

    subgraph CARD [" Card System "]
        ROWS --> C1[buildCard\nInject model score + movie metadata]
        C1 --> C2[Create DOM\nPoster · Match Badge · Quick-Add]
        C2 --> C3[Async fetchTMDBDetails\nResolves poster · cast · trailer meta]
        C3 --> C4[genre → --glow-color\nCSS custom property per genre]
        C2 --> C5[mouseenter\nSchedule hover popup 500ms]
        C2 --> C6[click\nOpen full detail modal]
    end

    subgraph SCROLL [" Infinite Scroll Engine "]
        C1 --> S1[Snapshot original children]
        S1 --> S2[Prepend 3 clones\nAppend 3 clones as buffer]
        S2 --> S3[Scroll to center\nof clone buffer]
        S3 --> S4[Passive scroll listener]
        S4 --> S5{Near right\nedge?}
        S5 -->|Yes| S6[appendBatch\nfetch next model-ranked items]
        S5 -->|No| S7{Near left\nedge?}
        S7 -->|Yes| S8[prependBatch\n+ compensate scrollLeft\nzero visual jump]
        S7 -->|No| S4
    end

    subgraph MODAL [" Modal System "]
        C6 --> M1[openModal\nhash routing #movie-id]
        M1 --> M2[Backdrop · Poster · Stats Grid]
        M2 --> M3[YouTube trailer embed\n/movie/id/videos]
        M2 --> M4[5-star rating\n→ localStorage → re-run model]
        M2 --> M5[AI reasoning pills\nCast grid · Not Interested]
    end
```

### Card Hover Expand

The Netflix-style hover popup uses a **delayed expansion** pattern to avoid accidental triggers during fast scroll:

```mermaid
flowchart TD
    A[mouseenter event] --> B[setTimeout 500ms delay]
    B --> C{mouseleave\nbefore timeout?}

    C -->|Yes — fast scroll| D[clearTimeout\nNo DOM change]
    C -->|No — intentional hover| E[buildExpandPanel\nAttach to card DOM]

    E --> F[Clamp to viewport\nLeft or right expand]
    F --> G[CSS morph\ncard-is-expanded class]

    G --> H{Panel\nmouseleave?}
    H -->|Yes| I[hidePopup\nCollapse card]
    H -->|No| G
```

### Infinite Scroll Engine

True infinite scroll — not pagination, not lazy loading — is achieved by maintaining a circular buffer of DOM clones. The engine prepends and appends batches as the user scrolls, compensating for the scroll position change that prepending would otherwise cause, resulting in zero visual jump in either direction.

### Dynamic Glow Extraction

Each card gets a CSS custom property `--glow-color` derived from its primary genre at render time:

| Genre | Glow Hex | Token |
|---|---|---|
| Sci-Fi | `#818cf8` | `rgba(129,140,248,0.5)` |
| Action | `#ef4444` | `rgba(239,68,68,0.5)` |
| Comedy | `#34d399` | `rgba(52,211,153,0.5)` |
| Drama | `#f59e0b` | `rgba(245,158,11,0.5)` |
| Horror | `#a855f7` | `rgba(168,85,247,0.5)` |
| Romance | `#f472b6` | `rgba(244,114,182,0.5)` |
| Thriller | `#fb923c` | `rgba(251,146,60,0.5)` |
| Default | `#a78bfa` | `rgba(167,139,250,0.5)` |

---

## 🧭 Onboarding & Preference Learning

The onboarding flow is the model's cold-start solution — a three-step sequence that runs before the main app renders, gathering enough signal to populate a fully personalized feed for a brand new user. Genre and language preferences seed the initial content profile; swipe decisions train the model's exclusion list and warm up the taste vector with real interaction data.

```mermaid
flowchart TD
    A([User Logs In]) --> B{Onboarding\ncomplete?}

    B -->|Yes| C[Load Main App\n17 model-ranked rows]
    B -->|No| D[Show Onboarding Overlay]

    D --> E[Step 1 — Taste Selection\nGenre pills · Language pills · Talent search]
    E --> F[Step 2 — Swipe Deck\nFetch movies matching selected preferences]

    F --> G[3-Card Stack\nStaggered scale + opacity depth effect]
    G --> H{Drag threshold\nexceeds 120px?}

    H -->|Right 👍| I[Add to swipedLikes\nFetch /recommendations for more]
    H -->|Left 👎| J[Add to swipedDislikes\nExclude from future results]
    H -->|Up ⏭| K[Skip card]
    H -->|Below threshold| L[Snap back to center\nNo action recorded]

    I --> M[Shift from swipeQueue\nrenderNextDeckCards]
    J --> M
    K --> M
    L --> G

    M --> N{swipedLikes\n≥ 10?}
    N -->|No — need more signal| G
    N -->|Yes — enough to model| O[Step 3 — completeOnboarding\nCalculate excludedGenres · Save to localStorage]

    O --> P[Curating your feed...\n4 status messages · 600ms each]
    P --> C
```

### The Swipe Feedback Loop

The most interesting aspect of onboarding is that it doesn't stop learning once you start swiping. Every right-swipe immediately triggers a fetch for similar movies, dynamically expanding the queue without ever running out of content:

```mermaid
flowchart TD
    A([Swipe Right on Movie M]) --> B[Add M to swipedLikes]

    B --> C{API Key\nPresent?}

    C -->|Yes| D[Fetch /movie/M/recommendations\nLive TMDb endpoint]
    C -->|No| E[Match genres in MOVIES\nOffline corpus search]

    D --> F[Filter results\nUnseen · Not disliked · Released]
    E --> F

    F --> G{Results\nfound?}
    G -->|Yes| H[Append ≤5 to swipeQueue\nMore signal → better cold-start]
    G -->|No| I[Expand genre search\nLoosen constraints]
    I --> F

    H --> J[Queue grows dynamically\nUser never runs out of cards]
```

By the time onboarding completes, ATLASS has gathered enough signal to distinguish between someone who likes *cerebral* sci-fi versus someone who prefers *action* sci-fi — even if both swiped right on the same genre pill.

---

## 💾 State Management & Persistence

ATLASS has no Redux, no Zustand, no reactive store. State is a plain JavaScript object that every module imports and mutates directly. Persistence is handled by a small set of helper functions that serialize state to `localStorage` on every meaningful change — intentionally minimal and surprisingly effective.

```mermaid
flowchart TD
    A([User Action\ne.g. Add to Watchlist]) --> B[state.watchlist.push\nMutate shared state object]

    B --> C[saveWatchlistToStorage\nJSON.stringify → localStorage]
    C --> D[updateWatchlistUI\nRebuild watchlist strip DOM]

    D --> E[updateWLCount\nUpdate nav badge]
    E --> F[syncWatchlistButtons\nCards · Hero · Modal · Platform]

    F --> G{movieLensData\nloaded?}
    G -->|Yes| H[initializeRecommender\nRe-run hybrid model\nwith updated ratings]
    G -->|No| I[Skip model update\nInsufficient data]

    H --> J[New ranked results\nRefresh personalized rows]
```

### localStorage Schema

| Key | Format | Example |
|---|---|---|
| `user_watchlist` | `Movie[]` | `[{id:1, title:"Dune: Part Two", …}]` |
| `user_movie_ratings` | `{id: rating}` | `{"968051": 4.5, "872585": 5}` |
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
flowchart TD
    subgraph INIT [" Gallery Initialization "]
        I1([initPickGallery]) --> I2{Watchlist\nLength?}
        I2 -->|0 movies| I3[Show empty state\nAdd movies to unlock]
        I2 -->|1 movie| I4[Show add-more lock\nNeed at least 2]
        I2 -->|≥ 2 movies| I5[Map to gallery items\nweserv.nl poster proxy]
        I5 --> I6[Load OGL from CDN\nRenderer · Camera · Scene]
        I6 --> I7[PlaneGeometry\n100×50 segments per card\nMesh + Shader per movie]
        I7 --> I8[Start rAF render loop\n60fps animation]
    end

    subgraph SPIN [" Spin Mechanics "]
        S1([User clicks Spin It!]) --> S2[Pick random winning movie]
        S2 --> S3[Compute target\ncurrentIndex + 4×N + offset]
        S3 --> S4[Set scroll.target\n= index × itemWidth]
        S4 --> S5[Ease toward target\nfactor = 0.04 per frame]
        S5 --> S6{Delta < 0.15?\nSettled?}
        S6 -->|No — still moving| S5
        S6 -->|Yes — landed| S7[Set uWinningTarget = 1.0\nActivate gold glow shader]
        S7 --> S8[Show Tonight's Pick overlay\n+ confettiBurst 75 particles]
    end

    INIT --> SPIN
```

### The Bend Formula

The gallery's characteristic curve is computed per-frame using a circular arc formula. Each card's position is mapped to a point on a circle whose radius is derived from the bend intensity:

Given bend magnitude $B$ and half-viewport width $H$, the arc radius is:

$$R = \frac{H^2 + B^2}{2B}$$

For a card at screen-x offset $x$, its vertical arc displacement is:

$$\text{arc} = R - \sqrt{R^2 - \min(|x|,\, H)^2}$$

Cards above center use $y = -\text{arc}$ with rotation $= -\text{sign}(x)\cdot\arcsin(eX/R)$; cards below invert both. The bend curvature (0.0–5.0) is user-configurable in Settings and persisted to `localStorage` as `roulette_bend`.

### Audio Synthesis

The spin sequence is scored entirely with the **Web Audio API** — no audio files, no samples. All sounds are synthesized from oscillators and noise at runtime:

| Sound | Synthesis | Character |
|---|---|---|
| `playTick()` | Square wave 880→440 Hz, 60 ms | Card click feedback |
| `playSpinAccel()` | Sawtooth 110→440 Hz, 1.2 s | Gallery acceleration |
| `playWhoosh()` | Bandpass noise, 1.5 s | Momentum blur |
| `playWin()` | C5-E5-G5-C6 arpeggio, triangle | Win fanfare |
| `playClick()` | Triangle 600→300 Hz, 40 ms | UI interactions |

### Shader Highlights

The GLSL fragment shader handles rounded-corner masking via a signed-distance function, aspect-fill correction, and the winning-card gold glow — all in a single pass:

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
├── index.html              # Single-page shell — all sections, modals, overlays
├── style.css               # ~4,000 lines, custom properties, dark/light themes
├── app.js                  # Entry point — orchestrates init sequence (72 lines)
├── state.js                # Shared reactive state + localStorage helpers (67 lines)
├── config.js               # TMDb API key, protocol detection, default rec IDs
├── recommender.js          # Recommendation orchestrator + MovieLens CSV loader (373 lines)
├── ml-model.js             # Hybrid SVD + Content model inference engine (142 lines)
├── ui.js                   # Core UI engine — cards, rows, modals, popups (2,500+ lines)
├── CircularGallery.js      # WebGL OGL-based 3D circular gallery / Roulette (311 lines)
├── PillNav.js              # GSAP-powered animated pill navigation (86 lines)
├── onboarding.js           # Taste learning flow — selection + swipe deck (742 lines)
├── data.js                 # 12-movie fallback dataset with full metadata (121 lines)
└── data/
    ├── model.json          # Pre-trained SVD model (k=32, ~500 KB)
    ├── content_model.json  # Pre-trained content model (dim=48, ~200 KB)
    └── ml-latest-small/
        ├── movies.csv      # 9,742 movies with titles and genres
        ├── ratings.csv     # 100,836 ratings from 610 users
        ├── links.csv       # MovieLens → TMDb / IMDb ID mapping
        └── tags.csv        # User-applied tags
```

### Module Dependency Graph

```mermaid
flowchart LR
    APP[app.js] --> STATE[state.js]
    APP --> CFG[config.js]
    APP --> REC[recommender.js]
    APP --> UI[ui.js]
    APP --> NAV[PillNav.js]
    APP --> OB[onboarding.js]

    REC --> ML[ml-model.js]
    REC --> UI
    ML --> MJ[(model.json)]
    ML --> CJ[(content_model.json)]
    REC --> CSV[(ml-latest/*.csv)]

    UI --> DATA[data.js]
    UI --> CG[CircularGallery.js]
    UI --> REC

    OB --> DATA
    OB --> UI

    style APP fill:#fbbf24,stroke:#d97706,color:#000
    style REC fill:#60a5fa,stroke:#2563eb,color:#000
    style ML  fill:#a78bfa,stroke:#7c3aed,color:#000
    style UI  fill:#f87171,stroke:#dc2626,color:#000
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| ML — Collaborative | SVD (32 latent factors), pre-trained offline | Fold-in enables personalization at runtime without retraining |
| ML — Content | TF-IDF + LSA (48-dim) | Latent semantic analysis on Wikipedia plot text for semantic matching |
| ML — Inference | Browser-native JSON weight matrices | The trained model ships as `model.json` + `content_model.json`; inference runs client-side, zero server |
| Dataset | [MovieLens ml-latest-small](https://grouplens.org/datasets/movielens/) | 9,742 movies · 100,836 ratings · 610 users |
| Live Data | [TMDb API v3](https://developer.themoviedb.org/docs) | Posters, trailers, cast, streaming providers |
| Rendering | DOM + WebGL via [OGL](https://github.com/oframe/ogl) | DOM for UI; WebGL for the 3D curved gallery |
| Language | Vanilla JavaScript (ES Modules) | No build step needed — model inference runs directly in the browser |
| Fonts | Syne + DM Sans via Google Fonts | Editorial magazine aesthetic |
| Icons | Font Awesome 6 | Consistent icon system |
| Animation | CSS keyframes + GSAP + Web Audio API | Pill nav, surprise orb, WebGL spin SFX |
| State | Single shared `state` object + `localStorage` | No Redux, no reactivity library needed |
| Build | **None** | ES modules via `<script type="module">` |

---

## 🚀 Running Locally

No Node.js required. No `npm install`. Just a web server.

```bash
# Python 3 (recommended — zero dependencies)
python -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080`.

> **⚠️ Important:** Do **not** open `index.html` via `file://`. CORS policy blocks `fetch()` calls to local CSV files and the TMDb API. Always serve through a local web server.

---

## 🔑 API Key Setup

The bundled key works immediately. To substitute your own for higher rate limits:

1. Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Open the app → click the avatar (top-right) → **Settings** → **API** tab
3. Paste your key and click **Test**
4. A green indicator confirms the connection; the page reloads in live mode

### Offline Fallbacks

| Feature | Fallback |
|---|---|
| Movie metadata | MovieLens CSV data |
| Posters | Unsplash placeholder images |
| Match scores | `85 + ((movieId × 7) % 15)` |
| Recommendations | SVD + Content hybrid model |
| Trending | Curated MovieLens IDs |
| Platform Browser | Cached platform data |

---

## 🌐 Browser Compatibility

| Feature | Minimum |
|---|---|
| ES Modules | Chrome 61 · Firefox 60 · Safari 10.1 |
| WebGL | Any GPU-accelerated browser |
| Web Audio API | Chrome · Firefox · Safari |
| CSS Custom Properties | All modern browsers |
| `fetch()` | Chrome 42 · Firefox 39 · Safari 10.1 |
| `IntersectionObserver` | Chrome 58 · Firefox 55 · Safari 15.4 |
| `ResizeObserver` | Chrome 64 · Firefox 69 · Safari 13.1 |

---

## 📜 License & Attributions

Built for educational and portfolio purposes.

- **MovieLens Dataset** — F. Maxwell Harper and Joseph A. Konstan. 2015. *The MovieLens Datasets: History and Context.* ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4: 1–19. Used under the [GroupLens Research License](https://grouplens.org/datasets/movielens/).
- **TMDb** — This product uses the TMDb API but is not endorsed or certified by TMDb. Data subject to [TMDb Terms of Use](https://www.themoviedb.org/documentation/api/terms-of-use).
- **OGL** — WebGL library by [oframe](https://github.com/oframe/ogl), MIT License.
- **GSAP** — GreenSock Animation Platform, standard GreenSock license.
- **Font Awesome** — Font Awesome Free license.
- **Google Fonts** — Syne + DM Sans, Open Font License.

---

<div align="center">

Made with obsessive attention to detail by [Utkarsh Singh](https://github.com/4-thkind) && [Pranav Pant](https://github.com/pranavpant9916-ctrl)

*The model runs in your browser. Every recommendation is earned.*

</div>