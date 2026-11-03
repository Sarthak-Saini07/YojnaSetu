# System Architecture & Technical Specifications

This document presents the structural and procedural architecture of the **Government Scheme Recommendation System**, detailing system components, control flows, data pipelines, and database schemas.

---

## 1. High-Level 3-Tier System Architecture

The application adopts a modular, decoupled 3-tier architecture comprising a modern React Single Page Application (SPA), an asynchronous FastAPI REST backend, a MongoDB Atlas document store, and an isolated external AI abstraction layer.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Frontend)"]
        User["User / Citizen"]
        ReactApp["React SPA (Vite + Tailwind CSS v4)"]
        StateManagement["React Context (AuthContext, UI State)"]
        User --> ReactApp
        ReactApp --- StateManagement
    end

    subgraph API Gateway ["Backend Services Layer (FastAPI REST API)"]
        FastAPI["FastAPI Application"]
        AuthMiddleware["JWT Auth & Role Authorization Middleware"]
        
        subgraph Core Modules ["Application Modules"]
            AuthModule["Auth & User Profile Service"]
            SchemeModule["Scheme Management Service (CRUD & Admin)"]
            AIExtractModule["AI Profile Extraction Service"]
            EligibilityEngine["Deterministic Eligibility Engine"]
            RecommenderEngine["Deterministic Recommendation Ranking Engine"]
        end
    end

    subgraph Data & External Layer ["Data & External Integration Layer"]
        MongoDB[("MongoDB Atlas Cloud Database")]
        ExternalLLM["External LLM Provider (Google Gemini API / Mock Provider)"]
    end

    %% Flow connections
    ReactApp -- "HTTP REST / JSON (JWT Header)" --> FastAPI
    FastAPI --> AuthMiddleware
    AuthMiddleware --> CoreModules

    AuthModule -- "PyMongo Queries" --> MongoDB
    SchemeModule -- "PyMongo Queries (Excludes Archived)" --> MongoDB
    AIExtractModule -- "Sanitized Prompt / JSON Mode" --> ExternalLLM
    
    AIExtractModule -- "Structured Profile JSON" --> ReactApp
    ReactApp -- "Confirmed Profile Input" --> EligibilityEngine
    EligibilityEngine --> RecommenderEngine
    RecommenderEngine -- "Read Scheme Criteria" --> SchemeModule
```

### Architectural Principles & Boundaries
1. **Decoupled Engine**: The eligibility engine (`EligibilityEngine`) is completely isolated from HTTP controllers and database models, accepting pure Pydantic profile/scheme primitives.
2. **AI Boundary Isolation**: The AI layer (`AIExtractModule`) communicates exclusively with external LLM providers or mock adapters. It converts raw natural-language text into candidate structured user profile fields. It **never** interacts with the eligibility engine directly and **never** makes eligibility decisions.
3. **Admin Access Control**: All administrative endpoints (`POST/PUT/DELETE /api/schemes/*`) are protected by dependency injection (`get_current_admin`), enforcing HTTP 403 Forbidden for non-admin users.

---

## 2. Natural-Language AI Profile Extraction Flow

The natural-language extraction pipeline enforces strict user agency and validation. AI extraction outputs must be reviewed and confirmed by the citizen before any eligibility evaluation occurs.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Citizen
    participant UI as React UI (Recommendations Page)
    participant API as FastAPI (/api/ai/parse-profile)
    participant Privacy as Privacy Sanitizer
    participant LLM as BaseLLMProvider (Gemini / Mock)
    participant Schema as Pydantic Schema Validator
    participant Engine as Deterministic Eligibility Engine

    User->>UI: Types raw text ("I am a 21yr old SC student in Punjab with income 2L")
    UI->>API: POST /api/ai/parse-profile { text }
    API->>Privacy: Sanitize input (strip credentials/tokens)
    Privacy->>LLM: Send sanitized text prompt
    LLM->>Schema: Return raw JSON output
    Schema->>Schema: Validate against UserProfile Pydantic schema
    Schema-->>API: Validated Profile JSON + missing_fields list
    API-->>UI: Return extracted fields & confidence metadata

    Note over UI, User: Mandatory User Review Step
    UI->>User: Display editable profile form modal (Highlight extracted fields)
    User->>UI: Corrects/confirms profile fields & clicks "Find Schemes"
    
    UI->>Engine: POST /api/eligibility/recommend { confirmed_profile }
    Engine-->>UI: Deterministic 3-Tier Recommendation Results
```

---

## 3. Deterministic Eligibility & Recommendation Flowchart

The eligibility engine processes user profile attributes against scheme criteria using pure boolean logic and missing-information tracking.

```mermaid
flowchart TD
    Start(["Input: UserProfile + Scheme Rules"]) --> CheckActive{"Is Scheme Active?<br/>(status == 'active')"}
    CheckActive -- "No (Archived)" --> Exclude["Exclude Scheme from Results"]
    CheckActive -- "Yes" --> RuleTree["Evaluate Criteria Rules (AND / OR Tree)"]

    RuleTree --> RuleEval{"Are any required fields<br/>missing from profile?"}
    
    RuleEval -- "Yes (Missing Data)" --> MarkInsufficient["Set Status = INSUFFICIENT INFORMATION<br/>Set match_score = NULL<br/>Record missing_fields"]
    
    RuleEval -- "No (Complete Data)" --> CriteriaCheck{"Do all rules evaluate<br/>to TRUE?"}

    CriteriaCheck -- "Yes" --> MarkEligible["Set Status = ELIGIBLE<br/>Calculate match_score (1.00 - 100%)<br/>Record matched_conditions"]
    CriteriaCheck -- "No" --> MarkNotEligible["Set Status = NOT ELIGIBLE<br/>Calculate partial match_score<br/>Record failed_conditions"]

    MarkEligible --> TierSorting["Tier 1: ELIGIBLE<br/>(Sorted by match_score DESC)"]
    MarkInsufficient --> TierSorting2["Tier 2: INSUFFICIENT INFORMATION<br/>(match_score = NULL, Action required)"]
    MarkNotEligible --> TierSorting3["Tier 3: NOT ELIGIBLE<br/>(Sorted by match_score DESC)"]

    TierSorting --> FinalOutput(["Return Grouped Recommendation Response"])
    TierSorting2 --> FinalOutput
    TierSorting3 --> FinalOutput
```

---

## 4. Entity-Relationship (ER) & Data Model Diagram

The persistent data storage is managed in MongoDB Atlas using indexed JSON document models.

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string email UK
        string password_hash
        string full_name
        string role "user | admin"
        object profile "Nested UserProfile Document"
        datetime created_at
        datetime updated_at
    }

    SCHEMES {
        ObjectId _id PK
        string slug UK
        string title
        string category
        string provider_level "central | state"
        string state
        string short_description
        string detailed_description
        object benefits "amount, description, type"
        object eligibility_criteria "rules, min_age, max_age, max_income, etc."
        array required_documents
        string application_url
        string status "active | archived"
        datetime last_verified
        datetime created_at
        datetime updated_at
    }

    BOOKMARKS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId scheme_id FK
        datetime created_at
    }

    USERS ||--o{ BOOKMARKS : "saves"
    SCHEMES ||--o{ BOOKMARKS : "is bookmarked in"
```

### Collection Schemas & Data Constraints

#### 1. `users` Collection
- **`email`**: Unique indexed string (`unique=True`).
- **`password_hash`**: Bcrypt salted hash string (never plain-text).
- **`role`**: Enums: `"user"` (default public registration) or `"admin"`.
- **`profile`**: Sub-document representing candidate demographic fields:
  - `age` (int), `gender` (string), `state` (string), `annual_income` (float), `occupation` (string), `education` (string), `category` (string), `is_student` (bool), `is_farmer` (bool), `is_disabled` (bool).

#### 2. `schemes` Collection
- **`slug`**: Unique indexed string (`unique=True`).
- **`status`**: Enums: `"active"` or `"archived"`. Queries for public endpoints filter strictly by `{ "status": "active" }`.
- **`eligibility_criteria`**: Structured rule definitions evaluated by engine:
  - `min_age`, `max_age`, `max_income`, `allowed_states`, `allowed_occupations`, `allowed_education`, `allowed_categories`, `required_student`, `required_farmer`, `required_disabled`.

#### 3. `bookmarks` Collection
- **Compound Unique Index**: `(user_id, scheme_id)` to prevent duplicate bookmarks.
