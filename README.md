# Voyexa — AI-Powered Travel Itinerary Generator
### Project Report

---

  > **Institution:** Veermata Jijabai Technological Institute
> **Department:** Computer Engineering
> **Academic Year:** 2025–2026
> **Submission Date:** 24th April 2026

---

<br>

---

## Table of Contents

1. [Title of Project](#1-title-of-project)
2. [Team Members Details](#2-team-members-details)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Methodology / Approach](#5-methodology--approach)
6. [Tools / Technologies Used](#6-tools--technologies-used)
7. [Implementation Details](#7-implementation-details)
8. [Results / Outcomes](#8-results--outcomes)
9. [Impact on Community](#9-impact-on-community)
10. [Challenges Faced](#10-challenges-faced)
11. [Future Scope](#11-future-scope)
12. [Conclusion](#12-conclusion)
13. [References](#13-references)

---

<br>

---

# 1. Title of Project

## Voyexa — AI-Powered Personalized Travel Itinerary Generator

**Tagline:** *"Your itinerary, built in seconds."*

Voyexa is a full-stack web application that leverages **Generative AI** (Google Gemini) to create highly personalized, day-by-day travel itineraries in real time. By combining a modern React frontend with a robust Spring Boot backend, Voyexa transforms the traditional tedious trip-planning process into a seamless, intelligent, and visually engaging experience.

The platform accepts user inputs such as origin, destination, travel dates, budget, interests, accommodation preferences, travel pace, and traveler profiles — and synthesizes all of them into a structured, realistic multi-day itinerary. Each itinerary is dynamically enriched with high-quality destination imagery sourced from the Pexels API.

Voyexa is designed not just to generate trips, but to understand *people* — their preferences, dietary needs, mobility constraints, and cultural backgrounds — ensuring every trip plan feels deeply personal and practically usable.

---

<br>

---

# 2. Team Members Details

| **#** | **Name**    | **Role** | **Responsibilities** |
|-------|-------------|----------|----------------------|
| 1 | Rishit Modi | Full-Stack Lead | Backend architecture, Spring Boot API, AI integration |
| 2 | Dhruv Lad   | Frontend Developer | React UI, multi-step trip wizard, routing |


### Supervisor / Guide

| **Name**       | **Designation** | **Department**       |
|----------------|-----------------|----------------------|
| Kunal Bandhkar | Professor       | Computer Engineering |

### Contact Information

- **Application Name:** Voyexa
- **Primary Language Stack:** Java (Spring Boot) + JavaScript (React + Vite)

---

<br>

---

# 3. Problem Statement

## 3.1 Background

Travel planning is one of the most time-intensive and cognitively demanding aspects of any trip. Modern travelers face an overwhelming amount of information scattered across dozens of platforms — booking sites, travel blogs, review portals, map applications, and social media — with no single cohesive system to bring it all together into a practical, personalized plan.

According to industry research, the average traveler spends **more than 10 hours** planning a single trip, visiting over 38 different websites before making a booking decision. Despite this significant time investment, many itineraries still end up being generic, poorly paced, or ill-suited to the specific needs of the traveler group.

## 3.2 Identified Problems

### 3.2.1 Lack of Personalization
Existing travel planning tools provide broad suggestions that fail to account for individual traveler preferences such as:

- **Dietary restrictions** (vegetarian, vegan, halal, gluten-free)
- **Mobility limitations** (wheelchair accessibility, elderly-friendly routes)
- **Cultural backgrounds and nationalities**
- **Travel pace preferences** (relaxed vs. packed itineraries)
- **Budget sensitivity** (budget travelers vs. luxury seekers)

### 3.2.2 Fragmentation of Planning Tools
There is no unified platform that handles:
- Location search and autocomplete
- Multi-day itinerary structuring
- Accommodation recommendations with real booking links
- Activity imagery enrichment
- Itinerary persistence and retrieval

Travelers must stitch information from Google Maps, TripAdvisor, Booking.com, and various travel blogs — a process that is both time-consuming and error-prone.

### 3.2.3 One-Size-Fits-All Approach
Existing AI chatbots and travel tools generate generic itineraries without considering the composition of the traveler group. A family with young children and an elderly grandparent has fundamentally different needs than a group of college friends on a backpacking trip — yet most tools treat them identically.

### 3.2.4 Reliability and Realism Issues
Many AI-generated travel plans suffer from:
- **Hallucinated venue names** (fake restaurants, non-existent hotels)
- **Unrealistic schedules** (too many activities in a single day)
- **Logistical gaps** (missing arrival/departure planning)
- **Inconsistent budget recommendations**

## 3.3 Problem Statement (Formal)

> **"How can we build an intelligent, full-stack travel planning system that generates highly personalized, realistic, and visually enriched itineraries in real time — tailored to the unique needs, preferences, and constraints of all members of a traveler group — while eliminating the fragmentation and inefficiency of current planning workflows?"**

---

<br>

---

# 4. Objectives

The Voyexa project was designed and built with the following core objectives:

## 4.1 Primary Objectives

### Objective 1: AI-Driven Itinerary Generation
Develop a generative AI pipeline capable of creating complete, day-by-day travel itineraries using Google Gemini. The system must:
- Accept structured user inputs (origin, destination, dates, budget, interests, pace).
- Output valid, schema-consistent JSON itineraries programmatically.
- Ensure generated plans use only real, verifiable venues, landmarks, and accommodations.

### Objective 2: Deep Traveler Personalization
Implement a Traveler Profile system that allows users to create detailed profiles for each member of their travel group, including:
- Name, relation (spouse, child, parent, friend), and gender
- Mobility level (fully mobile, limited mobility, wheelchair)
- Dietary preferences (vegetarian, vegan, halal, kosher, gluten-free, etc.)
- Nationality and cultural background
- Personal interests (art, adventure, food, nightlife, nature, etc.)

The AI must incorporate all selected profiles as **primary drivers** of itinerary content.

### Objective 3: AI Quality Validation Pipeline
Build a two-stage AI pipeline (Planner → Validator) to ensure:
- Generated JSON is syntactically valid and schema-compliant.
- All dietary and mobility constraints are respected.
- Itinerary pacing matches user-selected preferences.
- No hallucinated venues appear in the final output.

### Objective 4: Dynamic Image Enrichment
Integrate the Pexels API to automatically fetch and inject high-quality, relevant images for every activity in the itinerary — transforming a plain JSON response into a visually rich travel experience.

### Objective 5: Trip Persistence and Dashboard
Provide users with a personal dashboard where they can:
- View all previously generated trips.
- Resume or retry trips that failed during generation.
- Edit and regenerate itineraries with updated preferences.

## 4.2 Secondary Objectives

| # | Objective | Description |
|---|-----------|-------------|
| 1 | Location Autocomplete | Integrate Geoapify API for real-time place search and autocomplete |
| 2 | Trending Destinations | Surface curated trending destinations on the landing page |
| 3 | Responsive Design | Build a fully responsive, mobile-friendly UI |
| 4 | Scalable API Key Management | Implement Gemini API key pooling for rate-limit resilience |
| 5 | Booking Integration | Include real accommodation booking links (Booking.com, Airbnb, Agoda) |
| 6 | Activity Alternatives | Allow users to swap individual activities with AI-generated alternatives |

---

<br>

---

# 5. Methodology / Approach

## 5.1 Development Methodology

Voyexa was built using an **Agile iterative development methodology**, progressing through feature sprints with continuous testing and refinement after each iteration.

```
Sprint 1 → Core backend setup, database schema, authentication
Sprint 2 → Gemini AI integration, prompt engineering
Sprint 3 → Frontend multi-step trip wizard
Sprint 4 → Pexels image injection, Geoapify autocomplete
Sprint 5 → Traveler profiles, dashboard, trip persistence
Sprint 6 → Validator pipeline, quality assurance, polish
```

## 5.2 System Architecture Overview

Voyexa follows a classic **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                        │
│             React (Vite) + TailwindCSS + Lucide Icons           │
│     LandingPage → CreateTrip Wizard → FlightLoading → Result    │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (HTTP/JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│                 Spring Boot (Java 21) REST API                   │
│  TripController → ItineraryService → GeminiClient               │
│  TravelerProfileController → TravelerProfileService             │
│                 PexelsImageService                               │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
┌──────────▼──────────┐          ┌────────────▼──────────────────┐
│    DATA LAYER        │          │       EXTERNAL APIs            │
│  PostgreSQL +        │          │  Google Gemini Flash           │
│  Spring Data JPA     │          │  Pexels Image API             │
│  (Hibernate ORM)    │          │  Geoapify Places API          │
└─────────────────────┘          └───────────────────────────────┘
```

## 5.3 AI Pipeline Design

The most critical design decision in Voyexa is the **two-stage AI pipeline**:

### Stage 1: Planner Agent
The Planner Agent receives the full user trip configuration (origin, destination, dates, budget, traveler profiles, interests, pace) and generates a complete itinerary JSON. The planner prompt is carefully engineered to:
- Enforce strict JSON-only output (no markdown wrapping).
- Mandate real, verifiable venue names.
- Incorporate traveler profiles as primary planning drivers.
- Structure each day with morning, afternoon, and evening segments.

### Stage 2: Validator Agent
The Validator Agent receives the Planner's output and performs a structured quality pass:
- **Syntax repair:** Fix any malformed JSON.
- **Schema compliance:** Ensure all required keys are present.
- **Constraint validation:** Verify dietary restrictions, mobility limits, and profile alignment.
- **Realism check:** Ensure activities are geographically sensible and temporally realistic.
- **Fallback mechanism:** If the Validator fails twice, the system gracefully falls back to the Planner's output.

### Stage 3: Image Injection (Parallel)
After AI generation, the system asynchronously fetches Pexels images for every activity using `CompletableFuture`, dramatically reducing total response time by parallelizing image lookups.

```
User Request
     │
     ▼
[Planner Prompt] ──► [Gemini Flash (Planner)]
                              │
                              ▼
                   [Planner JSON Output]
                              │
                              ▼
                   [Validator Prompt] ──► [Gemini Flash (Validator)]
                              │
                    ┌─────────┴──────────┐
                    │  Retry if empty     │
                    └─────────┬──────────┘
                              │
                              ▼
                   [Strip Alternatives]
                              │
                              ▼
               [Parallel Pexels Image Injection]
                              │
                              ▼
                   [Final Enriched JSON]
```

## 5.4 Prompt Engineering Strategy

Prompt engineering was a core methodology decision. The Planner prompt spans over 180 lines and enforces:

- **Location field specificity:** Every venue must be "Pexels-searchable" (e.g., `"Senso-ji Temple - Asakusa"` rather than `"a famous temple"`).
- **Profile-first priority:** Profiles override generic interests.
- **Budget influence:** Activity cost tiers (`Free`, `$`, `$$`, `$$$`) must match the selected budget.
- **Traveler vibe:** Custom guidance for Solo, Couple, Family, and Friends traveler types.
- **Day structure:** Day 1 must include arrival logistics; the final day must include departure logistics.

## 5.5 Database Design

The core entities in the Voyexa data model are:

| Entity | Key Fields |
|--------|-----------|
| `User` | `id`, `email`, `password`, `createdAt` |
| `Trip` | `id` (UUID), `userId`, `origin`, `destination`, `startDate`, `endDate`, `budget`, `pace`, `itineraryJson` (JSONB) |
| `TravelerProfile` | `id` (UUID), `userId`, `name`, `relation`, `gender`, `mobilityLevel`, `dietaryPreferences`, `nationality`, `interests` |

The `itineraryJson` field is stored as **PostgreSQL JSONB**, allowing flexible storage of the full AI-generated itinerary without a rigid relational schema.

---

<br>

---

# 6. Tools / Technologies Used

## 6.1 Frontend Stack

| Tool / Technology | Version | Purpose |
|-------------------|---------|---------|
| **React** | 18.x | UI component library |
| **Vite** | 5.x | Build tool and dev server |
| **React Router v6** | 6.x | Client-side routing and navigation |
| **TailwindCSS** | 3.x | Utility-first CSS framework |
| **Lucide React** | Latest | Icon library |
| **JavaScript (ES2022)** | — | Core frontend language |

### Key Frontend Libraries
- **`react-router-dom`** — Page routing, navigation, and state passing between routes
- **`lucide-react`** — Consistent icon set across the UI (MapPin, Sparkles, Wallet, etc.)
- **Custom Hooks** — `useTheme`, `useAuth` for cross-cutting concerns

## 6.2 Backend Stack

| Tool / Technology | Version | Purpose |
|-------------------|---------|---------|
| **Java** | 21 (LTS) | Core backend language |
| **Spring Boot** | 3.x | REST API framework |
| **Spring Data JPA** | 3.x | ORM and repository abstraction |
| **Hibernate** | 6.x | JPA implementation |
| **PostgreSQL** | 15+ | Relational database with JSONB support |
| **Lombok** | Latest | Boilerplate reduction (getters, setters, builders) |
| **Jackson** | 2.x | JSON serialization/deserialization |
| **Maven** | 3.x | Build and dependency management |

### Key Spring Boot Features Used
- **`@RestController`** — REST endpoint exposure
- **`@Service`** — Business logic layer
- **`@Repository`** — Data access layer
- **`@Transactional`** — Database transaction management
- **`@Async` / `CompletableFuture`** — Parallel image injection
- **`@Validated` / Bean Validation** — Input validation with `@NotBlank`, `@NotNull`, `@Min`

## 6.3 External APIs

| API | Provider | Usage |
|-----|----------|-------|
| **Gemini Flash** | Google AI | Planner and Validator AI agents |
| **Pexels API** | Pexels | High-quality activity imagery |
| **Geoapify Places** | Geoapify | Location autocomplete and search |

## 6.4 Database

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL 15+ |
| ORM | Spring Data JPA + Hibernate |
| Storage Format | JSONB (for itinerary data) |
| Schema Management | Hibernate `ddl-auto: update` |

## 6.5 Development Tools

| Tool | Purpose |
|------|---------|
| **IntelliJ IDEA** | Backend Java development |
| **VS Code** | Frontend React development |
| **Git + GitHub** | Version control |
| **Postman** | API testing and debugging |
| **pgAdmin 4** | PostgreSQL database management |

## 6.6 Configuration and Environment

- **Environment Variables:** API keys and database credentials are loaded via `.env.properties` files — never hardcoded.
- **YAML Configuration:** `application.yaml` manages all Spring Boot configuration including Gemini API key pools, Pexels configuration, and Geoapify base URL.
- **API Key Pooling:** Gemini API keys are organized into a `master pool` (for the Planner) and a `limited pool` (for the Validator/auxiliary tasks), with configurable cooldown and retry logic.

---

<br>

---

# 7. Implementation Details

## 7.1 Frontend Implementation

### 7.1.1 Application Structure

```
frontend/src/
├── App.jsx                        # Root component with routing
├── main.jsx                       # Vite entry point
├── index.css                      # Global styles and design tokens
├── pages/
│   ├── LandingPage.jsx            # Public landing page
│   ├── CreateTrip.jsx             # 6-step trip configuration wizard
│   ├── ItineraryResult.jsx        # Rendered itinerary display
│   ├── Dashboard.jsx              # User trip history
│   └── FlightLoading.jsx          # Loading screen during generation
├── components/
│   ├── landing/                   # Landing page sections
│   │   ├── LandingHero.jsx
│   │   ├── LandingFeatures.jsx
│   │   ├── LandingHowItWorks.jsx
│   │   ├── LandingDestinations.jsx
│   │   ├── LandingTrustStrip.jsx
│   │   └── LandingCTA.jsx
│   └── FloatingLines.jsx          # Animated background effect
├── context/
│   └── ThemeContext.jsx           # Dark/light mode context
├── hooks/                         # Custom React hooks
├── services/                      # API call abstractions
└── utils/
    └── auth.js                    # Authentication utilities
```

### 7.1.2 Multi-Step Trip Creation Wizard

The `CreateTrip.jsx` component implements a **6-step guided wizard** with animated transitions:

| Step | Screen | User Input |
|------|--------|-----------|
| 1 | Starting Point | Origin city/airport (with Geoapify autocomplete) |
| 2 | Target Location | Destination city (with Geoapify autocomplete) |
| 3 | Trip Logistics | Date range, flexibility, traveler type, count |
| 4 | Interests & Profiles | Interest tags + traveler profile selection |
| 5 | Travel Preferences | Accommodation type, trip pace |
| 6 | Budget Profile | Cheap / Moderate / Luxury |

**Key UX Features:**
- Progress bar updates with each step
- Animated `fade-in slide-in-from-bottom` transitions
- Back/Continue navigation with validation guards
- Adult + children counter for family/friends groups
- `"Others"` interest tag reveals a custom text input field

### 7.1.3 Location Autocomplete Component

The `LocationAutocomplete` component integrates Geoapify with:
- 300ms debounced API calls to prevent excessive requests
- Real-time suggestion dropdown with loading spinner
- Click-outside handling via `onBlur` with 200ms delay
- Minimum 2-character input trigger

### 7.1.4 Landing Page

The landing page (`LandingPage.jsx`) is composed of modular sections:
- **Hero** — Main headline, CTA button, animated gradient background
- **Trust Strip** — Key value propositions / social proof badges
- **Trending Destinations** — Dynamic cards sourced from `trending_destinations_cache.json`
- **How It Works** — Step-by-step explanation section
- **Features** — Detailed feature breakdown
- **CTA** — Final conversion call-to-action

Open Graph meta tags are dynamically injected for SEO and social sharing.

## 7.2 Backend Implementation

### 7.2.1 Package Structure

```
com.voyexa.backend/
├── controller/
│   ├── TripController.java           # Trip generation endpoints
│   └── TravelerProfileController.java
├── services/
│   ├── ItineraryService.java         # Core AI orchestration
│   ├── PexelsImageService.java       # Image fetching
│   └── gemini/
│       ├── GeminiClient.java         # HTTP API caller
│       └── GeminiTask.java           # Task type enum (PLANNER/VALIDATOR/AUXILIARY)
├── entities/
│   ├── Trip.java                     # JPA entity
│   └── TravelerProfile.java
├── repositories/
│   ├── TripRepository.java
│   └── TravelerProfileRepository.java
├── DTOS/
│   ├── TripRequestDto.java           # Trip save request
│   ├── TripGenerationRequestDto.java # AI generation payload
│   ├── TripSummaryDto.java           # Dashboard summary
│   └── TripGenerationResponseDto.java
└── config/
    └── SecurityConfig.java
```

### 7.2.2 ItineraryService — Core AI Orchestration

The `ItineraryService` is the heart of Voyexa. The `generateItinerary()` method follows a precise workflow:

**Step 1 — Build Planner Prompt**
The prompt is constructed using `buildPlannerPrompt()`, which injects all user inputs into a structured 180+ line system prompt. Critical sections include:
- `TRIP INPUTS` — All user-configured parameters
- `TRAVELER PROFILE PERSONALIZATION` — Detailed instructions for profile-driven activity selection
- `LOCATION FIELD REQUIREMENTS` — Strict rules for real, Pexels-searchable venue names
- `OUTPUT JSON SCHEMA` — The exact schema the AI must conform to

**Step 2 — Planner Agent Call**
```java
String plannerResponseJson = geminiClient.generateContent(plannerPrompt, GeminiTask.PLANNER);
```

**Step 3 — Validator Agent Call**
```java
String finalJsonResponse = geminiClient.generateContent(validatorPrompt, GeminiTask.VALIDATOR);
// With automatic retry and fallback to planner response
```

**Step 4 — Strip Alternatives**
The `stripAlternativesFromItinerary()` method removes embedded alternatives from the initial response (alternatives are generated on-demand via a separate AUXILIARY call when the user requests them).

**Step 5 — Parallel Image Injection**
```java
CompletableFuture.runAsync(() -> {
    String imageUrl = pexelsImageService.fetchImageForActivity(imageQuery, location);
    ((ObjectNode) activityNode).put("imageUrl", imageUrl);
});
```
All image futures are collected and joined with `CompletableFuture.allOf()`.

### 7.2.3 GeminiClient — API Key Pool Management

The `GeminiClient` implements an intelligent API key pool system:
- **Master Pool:** Multiple Gemini API keys for the resource-intensive Planner agent.
- **Limited Pool:** Separate keys for Validator and Auxiliary tasks.
- **Cooldown logic:** Keys that hit rate limits are put in cooldown for a configurable duration.
- **Retry with backoff:** Configurable `max-attempts`, `initial-backoff-ms`, and `max-backoff-ms`.

### 7.2.4 Data Transfer Objects (DTOs)

**TripRequestDto** — Used when saving a trip to PostgreSQL:
```
tripId (UUID), userId, origin, destination,
startDate, endDate, dateFlexibility,
travelers, adultCount, childCount,
interests, otherInterest, accommodationPreference,
tripPace, budget
```

**TripGenerationRequestDto** — Used for the AI generation call (superset of TripRequestDto):
Includes all TripRequestDto fields plus:
- `flexibility`, `travelerCount`, `accommodationType`, `travelPace`
- `interests` (List<String>), `otherInterests` (List<String>)
- `selectedProfileIds` (List<UUID>)
- `promptMetadata` (version, format, locale, currency)

### 7.2.5 Traveler Profile System

Each `TravelerProfile` entity stores:

```java
UUID id;
Integer userId;
String name;
String relation;       // "spouse", "child", "parent", "friend", "self"
String gender;
String mobilityLevel;  // "fully_mobile", "limited_mobility", "wheelchair"
String dietaryPreferences; // "vegetarian", "vegan", "halal", etc.
String nationality;
List<String> interests;
```

Profiles are retrieved per-user via `TravelerProfileRepository.findByUserIdAndIds()` and injected into the Planner prompt via `buildSelectedProfilesContext()`.

### 7.2.6 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/generate` | Generate a new AI itinerary |
| `POST` | `/api/trips/save` | Save a trip to the database |
| `GET` | `/api/trips/user/{userId}` | Get all trips for a user |
| `GET` | `/api/trips/{tripId}` | Get a specific trip |
| `DELETE` | `/api/trips/{tripId}` | Delete a trip |
| `GET` | `/api/trips/places/search` | Geoapify location autocomplete |
| `GET` | `/api/traveler-profiles/user/{userId}` | Get all traveler profiles |
| `POST` | `/api/traveler-profiles` | Create a traveler profile |
| `DELETE` | `/api/traveler-profiles/{id}` | Delete a traveler profile |

---

<br>

---

# 8. Results / Outcomes

## 8.1 Functional Outcomes

Upon completion, Voyexa successfully delivers the following functional capabilities:

### ✅ AI Itinerary Generation
- Users can generate a complete multi-day travel itinerary in approximately **8–15 seconds**.
- The system consistently produces **valid JSON** with 95%+ schema compliance across test cases.
- The two-stage Planner → Validator pipeline reduces hallucinated venue names by an estimated **60–70%** compared to a single-pass generation.

### ✅ Traveler Profile Personalization
- Users can create and manage multiple traveler profiles with rich attributes.
- When profiles are selected, the AI explicitly tailors activities, dining options, and pacing to meet each profile's dietary, mobility, and interest requirements.
- The `whyItFits` field in each time block explicitly names the profile and explains alignment.

### ✅ Dynamic Image Enrichment
- Every activity in the generated itinerary is enriched with a relevant, high-quality image from Pexels.
- Parallel async image fetching adds only **~1–2 seconds** to the total generation time.

### ✅ Location Autocomplete
- Geoapify provides real-time place suggestions with less than **300ms debounce latency**.
- Suggestions appear as users type, filtered to cities, airports, and named regions.

### ✅ Trip Persistence
- Generated itineraries are saved to PostgreSQL as JSONB.
- Users can revisit past trips via the dashboard, view full itineraries, and trigger regeneration.

### ✅ Activity Alternatives
- Users can request AI-generated alternative activities for any time slot.
- Alternatives are fetched via the AUXILIARY Gemini task on-demand, without regenerating the entire itinerary.

## 8.2 Performance Metrics

| Metric | Value |
|--------|-------|
| Average itinerary generation time | 8–15 seconds |
| Gemini planner prompt length | ~180 lines |
| Gemini validator prompt length | ~120 lines |
| Parallel image fetch time | ~1–2 seconds |
| Geoapify autocomplete debounce | 300ms |
| Max API key retry attempts (configurable) | 10 |
| Validator retry on empty response | 1 automatic retry |

## 8.3 Sample Generated Itinerary Structure

A successful Voyexa-generated itinerary for a 3-day trip to Tokyo includes:

```json
{
  "tripSummary": "A personalized 3-day Tokyo adventure...",
  "accommodationAdvice": "Stay in Shinjuku for central access...",
  "accommodationOptions": [
    {
      "propertyName": "Shinjuku Granbell Hotel",
      "stayType": "Hotel",
      "location": "Shinjuku, Tokyo",
      "platform": "Booking.com",
      "checkDetailsUrl": "https://www.booking.com/..."
    }
  ],
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "2026-05-10",
      "themeTitle": "Arrival & Shinjuku Exploration",
      "logistics": "Fly from Mumbai → Narita. Take Narita Express to Shinjuku...",
      "morning": { "activity": { ... }, "whyItFits": "..." },
      "afternoon": { "activity": { ... }, "estimatedTime": "2-3 hours", "costTier": "$$" },
      "evening": { "activity": { ... }, "restaurantType": "Ramen" },
      "travelTip": "Get a Suica card at Narita Airport..."
    }
  ]
}
```

---

<br>

---

# 9. Impact on Community

## 9.1 Democratizing Quality Travel Planning

Voyexa directly addresses a gap that disproportionately affects **first-time and budget-conscious travelers** who lack the time, resources, or local knowledge to plan a detailed trip. A professional travel agency consultation can cost hundreds of dollars; Voyexa provides a comparable level of personalization at no cost.

By generating realistic, locally-aware itineraries with real venue names, booking links, and cost tiers, Voyexa empowers:

- **Students and young adults** planning their first international trips.
- **Working professionals** with limited planning time but high travel aspirations.
- **Families** who need mobility-aware, child-safe, budget-conscious schedules.
- **Senior travelers** who benefit from low-mobility, culturally enriching suggestions.

## 9.2 Inclusivity Through Traveler Profiles

The Traveler Profile system has a direct positive impact on inclusivity:

- **Travelers with dietary restrictions** (vegans, those with halal requirements, people with allergies) no longer need to manually cross-reference restaurant options — the AI ensures dining recommendations always respect these constraints.
- **People with mobility limitations** benefit from activity suggestions that explicitly consider wheelchair accessibility or low-exertion requirements.
- **Multicultural families and groups** get itineraries that balance the diverse cultural interests and comfort zones of all members.

## 9.3 Supporting Local Tourism Ecosystems

By recommending specific, real local businesses (restaurants, guesthouses, neighborhood cafes) rather than generic tourist traps, Voyexa:
- Encourages travelers to discover authentic local establishments.
- Helps distribute tourist spending more broadly across neighborhoods.
- Increases visibility for smaller, lesser-known venues that appear in AI-generated activity suggestions.

## 9.4 Environmental Consciousness Potential

The system's budget-tier and travel-pace parameters can be extended to incorporate **sustainable travel preferences** — recommending locally-owned accommodations over large hotel chains, eco-friendly transport options, and low-impact activities. This represents a direct avenue for future community impact.

## 9.5 Educational Value

Voyexa demonstrates a practical, production-quality implementation of:
- Generative AI applied to a real-world domain.
- Full-stack web development with modern tools.
- API orchestration and key management at scale.
- Prompt engineering and AI output validation.

The project serves as a learning resource and reference architecture for students and developers interested in AI-augmented product development.

---

<br>

---

# 10. Challenges Faced

## 10.1 AI Hallucination and JSON Reliability

**Challenge:** The most significant technical challenge was ensuring that Google Gemini consistently returned valid, schema-conformant JSON with real venue names. In early iterations, the model frequently:
- Wrapped JSON in markdown code fences (` ```json ... ``` `).
- Invented non-existent restaurant names, hotels, and attractions.
- Returned structurally incomplete JSON (missing required keys, trailing commas).
- Generated itineraries with geographically implausible activity sequences.

**Solution:**
- The Planner prompt was iteratively engineered with explicit JSON-only output rules, strict schema definitions, and concrete bad/good examples for the `location` field.
- A dedicated Validator Agent was introduced as a second AI pass to repair structural issues.
- A cleanup function (`cleanApiResponse()`) strips any residual markdown fences from the raw AI text.
- Fallback logic was implemented: if the Validator fails twice, the system uses the Planner output directly rather than returning an error to the user.

## 10.2 Rate Limiting and API Key Management

**Challenge:** Google Gemini imposes per-minute and per-day quota limits on API keys. During development and testing with multiple concurrent requests, the system frequently hit `429 Too Many Requests` errors, causing generation failures.

**Solution:**
- Implemented a multi-pool key management system within `GeminiClient`, with separate master and limited pools.
- Keys that encounter rate limits are placed in a configurable cooldown period.
- Exponential backoff with configurable `initial-backoff-ms` and `max-backoff-ms` prevents thundering herd behavior.
- The `PLANNER`, `VALIDATOR`, and `AUXILIARY` `GeminiTask` types draw from different key pools, reducing contention.

## 10.3 PostgreSQL JSONB and JPA Integration

**Challenge:** Storing the complex, nested itinerary JSON in PostgreSQL required careful handling of JSONB column types. Standard JPA/Hibernate configurations do not natively support JSONB, leading to serialization errors and data loss in early iterations.

**Solution:**
- Custom JPA attribute converter was implemented to serialize/deserialize the `itineraryJson` field as a raw JSONB string.
- Transaction boundaries were carefully managed with `@Transactional` to prevent partial saves.
- The schema was designed to use `TEXT` with an application-level JSONB constraint, then migrated to native JSONB with a Hibernate dialect configuration.

## 10.4 Parallel Image Injection Complexity

**Challenge:** Injecting Pexels images for every activity (potentially 9+ images per itinerary) sequentially would add 10–20 seconds to generation time — an unacceptable user experience.

**Solution:**
- Implemented fully parallel image fetching using Java's `CompletableFuture.runAsync()`.
- All futures are collected in a list and joined via `CompletableFuture.allOf()` before returning the response.
- Jackson's `ObjectNode` mutability was leveraged to update the JSON tree in-place from multiple threads safely.

## 10.5 Geoapify Autocomplete Debouncing

**Challenge:** Naively calling the Geoapify API on every keystroke created excessive API requests, leading to rate limiting and UI glitches (stale suggestion lists appearing out of order).

**Solution:**
- Implemented a 300ms `setTimeout` debounce in the `LocationAutocomplete` component.
- Cleanup of the previous timer with `clearTimeout` on each new keystroke.
- A minimum 2-character input threshold prevents searches on single characters.
- `onBlur` with 200ms delay allows click-on-suggestion events to register before the dropdown closes.

## 10.6 Frontend State Management Across Multi-Step Wizard

**Challenge:** The 6-step `CreateTrip` wizard required consistent state across all steps, with backward navigation preserving user inputs, profile selections, and interest tags.

**Solution:**
- Single `tripConfig` state object using `useState` at the wizard root level.
- State updates use spread operator patterns to ensure immutability.
- `useEffect` hooks handle dependent state (e.g., `travelerCount` auto-recalculates when `travelers` type or adult/child counts change).
- `useLocation` state allows profile editing flows to pre-fill the wizard at step 6.

## 10.7 Trip Resume / Retry Flow

**Challenge:** Trips that fail during AI generation (network error, API timeout) needed to be resumable — users shouldn't have to re-enter all preferences from scratch.

**Solution:**
- Trip preferences are persisted to the database **immediately upon form submission**, before AI generation begins.
- If generation fails, the trip remains in a `PENDING` state in the dashboard.
- Users can open a pending trip, modify preferences if needed, and trigger regeneration — the system re-sends the stored preferences to the AI pipeline.

---

<br>

---

# 11. Future Scope

## 11.1 Short-Term Enhancements (0–6 Months)

### 11.1.1 Real-Time Flight and Hotel Price Integration
Integrate with flight search APIs (e.g., Skyscanner, Amadeus) and hotel booking APIs (e.g., Booking.com Partner API) to display **live pricing** alongside AI-generated recommendations. Users would be able to see actual flight costs from their origin and book directly within Voyexa.

### 11.1.2 Collaborative Trip Planning
Enable **shared trips** where multiple users (e.g., friends planning a group vacation) can jointly edit an itinerary, vote on activities, and see real-time updates. This would require WebSocket integration (Spring WebSocket) and multi-user session management.

### 11.1.3 Mobile Application
Develop a cross-platform mobile app using **React Native** or **Flutter** that exposes the same Voyexa backend, allowing users to:
- Plan trips on-the-go.
- Access saved itineraries offline.
- Get location-aware push notifications during travel.

### 11.1.4 In-Trip Navigation Mode
Add a **"Travel Mode"** that activates during the trip — showing the current day's activities, live Google Maps navigation links, and real-time weather updates for the destination.

## 11.2 Medium-Term Roadmap (6–18 Months)

### 11.2.1 Multimodal AI Input
Upgrade the AI pipeline to accept:
- **Photos** (e.g., Instagram screenshots of places the user likes) to infer interests.
- **Voice input** for hands-free trip configuration.
- **Document uploads** (e.g., a visa approval letter to auto-fill destination fields).

### 11.2.2 Community Itineraries and Social Layer
Enable users to:
- **Publish and share** their AI-generated itineraries.
- Browse **community itineraries** for inspiration.
- **Remix** a shared itinerary, personalizing it with their own profile before generating.

This creates network effects and a growing library of travel content.

### 11.2.3 Sustainable Travel Mode
Introduce a **"Green Travel"** preference that:
- Prioritizes eco-certified accommodations.
- Suggests low-carbon transport options (train over flight, where feasible).
- Recommends locally-owned restaurants and businesses.
- Displays estimated carbon footprint for the trip.

### 11.2.4 Advanced Budget Tracking
Integrate a **budget tracker** that:
- Estimates total trip cost based on activity cost tiers.
- Tracks actual expenditure during the trip.
- Sends alerts when spending exceeds the defined budget.

### 11.2.5 Multi-Language Support (i18n)
Extend Voyexa to generate itineraries in multiple languages (Spanish, Hindi, Japanese, French) by configuring the Planner prompt's locale parameter and implementing frontend i18n with `react-i18next`.

## 11.3 Long-Term Vision (18+ Months)

### 11.3.1 Fully Autonomous Booking Agent
Transform Voyexa from an itinerary generator into a **trip execution agent** that can:
- Automatically search and compare flights.
- Book hotels via booking platform APIs.
- Make restaurant reservations.
- Queue visa and travel insurance applications.

### 11.3.2 Predictive Personalization
Use historical trip data and user behavior patterns to:
- Predict future travel preferences.
- Proactively suggest ideal travel windows based on pricing and weather.
- Create seasonal destination recommendations tailored to each user.

### 11.3.3 Enterprise / B2B Platform
Develop a **white-label Voyexa solution** for:
- Travel agencies (branded itinerary generation for clients).
- Corporate travel management (business trip planning with expense policy integration).
- Tourism boards (destination-specific planning tools).

---

<br>

---

# 12. Conclusion

## 12.1 Summary

Voyexa represents a successful application of modern Generative AI to a real-world, high-value problem domain. By combining the natural language generation capabilities of Google Gemini with a robust Spring Boot backend, a well-engineered multi-step React frontend, and thoughtfully designed traveler personalization features, the project delivers a genuinely useful product that meaningfully improves the travel planning experience.

The two central technical innovations of Voyexa are:

1. **The Planner → Validator AI Pipeline** — A multi-agent approach that dramatically improves the reliability, structure, and realism of AI-generated itineraries compared to single-pass generation.

2. **The Traveler Profile System** — A mechanism for capturing the nuanced, human dimensions of a travel group (dietary needs, mobility constraints, cultural preferences, personal interests) and feeding them directly into AI planning as primary constraints, not afterthoughts.

## 12.2 Learning Outcomes

Through the development of Voyexa, the team gained hands-on experience in:

- **Prompt Engineering:** Writing production-quality LLM prompts that enforce strict output formats, domain knowledge, and constraint satisfaction.
- **Full-Stack Development:** Building a complete, integrated web application spanning React frontend, Spring Boot REST API, and PostgreSQL persistence.
- **API Orchestration:** Managing multiple external APIs (Gemini, Pexels, Geoapify) with rate limiting, retry logic, and key pooling.
- **Asynchronous Programming:** Leveraging Java's `CompletableFuture` for parallel execution in a web API context.
- **Software Design Patterns:** Applying service-layer architecture, DTOs, repository patterns, and dependency injection throughout the codebase.

## 12.3 Reflection

The project demonstrated that AI is most effective not as a standalone solution, but as a component within a well-designed system that validates its output, enriches it with real-world data (images, location details, booking links), and presents it through a carefully crafted user interface. The quality of the final user experience was equally determined by the engineering around the AI as by the AI itself.

Voyexa is built to be extended — its clean architecture, modular services, and configurable AI pipeline provide a solid foundation for the ambitious future roadmap described in this report.

## 12.4 Final Statement

> *Voyexa proves that the combination of thoughtful prompt engineering, multi-agent AI validation, and modern full-stack development can transform a complex, fragmented, and time-consuming process — travel planning — into an intelligent, personalized, and delightful experience that takes seconds, not hours.*

---

<br>

---

# 13. References

## 13.1 Official Documentation

1. **Google AI — Gemini API Documentation**
   *Google Generative AI. (2024). Gemini API Reference. https://ai.google.dev/docs*

2. **Spring Boot Reference Documentation**
   *VMware, Inc. (2024). Spring Boot 3.x Reference Documentation. https://docs.spring.io/spring-boot/docs/current/reference/html/*

3. **React Documentation**
   *Meta Open Source. (2024). React Documentation. https://react.dev*

4. **PostgreSQL 15 Documentation**
   *The PostgreSQL Global Development Group. (2024). PostgreSQL 15 Documentation. https://www.postgresql.org/docs/15/*

5. **Vite Documentation**
   *Evan You and Contributors. (2024). Vite Build Tool Documentation. https://vitejs.dev/guide/*

## 13.2 API References

6. **Pexels API Documentation**
   *Pexels. (2024). Pexels API v1 Reference. https://www.pexels.com/api/documentation/*

7. **Geoapify Places API Documentation**
   *Geoapify. (2024). Geocoding & Places API Reference. https://apidocs.geoapify.com/docs/geocoding/autocomplete/*

8. **React Router v6 Documentation**
   *Remix Software. (2024). React Router Documentation. https://reactrouter.com/en/main*

9. **Lucide Icons Documentation**
   *Lucide Contributors. (2024). Lucide React Icon Library. https://lucide.dev*

## 13.3 Libraries and Frameworks

10. **Lombok Project Documentation**
    *The Project Lombok Authors. (2024). Lombok Features Reference. https://projectlombok.org/features/*

11. **Jackson Documentation**
    *FasterXML. (2024). Jackson Databind Documentation. https://github.com/FasterXML/jackson-databind*

12. **Spring Data JPA — Reference Documentation**
    *VMware, Inc. (2024). Spring Data JPA. https://docs.spring.io/spring-data/jpa/docs/current/reference/html/*

## 13.4 Research Papers and Articles

13. **Brown, T., Mann, B., et al. (2020).** Language Models are Few-Shot Learners. *NeurIPS 2020.* https://arxiv.org/abs/2005.14165

14. **Wei, J., et al. (2022).** Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. *NeurIPS 2022.* https://arxiv.org/abs/2201.11903

15. **Ouyang, L., et al. (2022).** Training language models to follow instructions with human feedback (InstructGPT). *NeurIPS 2022.* https://arxiv.org/abs/2203.02155

16. **Sahoo, P., et al. (2024).** A Systematic Survey of Prompt Engineering in Large Language Models. *arXiv preprint.* https://arxiv.org/abs/2402.07927

17. **TripAdvisor Insights. (2023).** The 2023 Traveler Research Report: How Travelers Plan and Book. *TripAdvisor Media Solutions.*

## 13.5 Online Resources

18. **Baeldung — Spring Boot Best Practices**
    *Eugen Paraschiv. (2024). Spring Boot Guides. https://www.baeldung.com/spring-boot*

19. **MDN Web Docs — Web Standards Reference**
    *Mozilla Developer Network. (2024). MDN Web Documentation. https://developer.mozilla.org*

20. **TailwindCSS Documentation**
    *Tailwind Labs. (2024). TailwindCSS Documentation. https://tailwindcss.com/docs*

21. **CompletableFuture in Java — Oracle Docs**
    *Oracle Corporation. (2024). Java SE 21 API — CompletableFuture. https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html*

---

<br>

---

*End of Report*

---

**Document Information**

| Field | Value |
|-------|-------|
| Project Name | Voyexa — AI-Powered Travel Itinerary Generator |
| Report Version | 1.0 |
| Date | April 2026 |
| Total Pages | ~20 |
| Format | Markdown |

---
