# Government Scheme Recommendation & Eligibility Platform

## 1. Project Goal

Build a production-style web application for Indian citizens to discover
government schemes they may be eligible for.

The system must:

-   Collect a structured user profile.
-   Search and browse government schemes.
-   Determine eligibility using a deterministic rule engine.
-   Rank eligible/relevant schemes.
-   Explain why a scheme is recommended.
-   Explain why a user is not eligible.
-   Display benefits, documents, application steps, official source, and
    last verified date.
-   Support natural-language queries through an AI layer.
-   Be designed for future Hindi/Hinglish and Punjabi support.
-   Include an administrator interface for maintaining scheme
    information.

The project is being developed by one student over approximately three
months. Keep the architecture simple, modular, testable, and
maintainable.

## 2. Non-Negotiable Principle

The eligibility engine is the source of truth.

An LLM must never make the final eligibility decision.

Correct flow:

Natural language -\> AI extraction -\> structured profile -\>
deterministic eligibility engine -\> MongoDB scheme data -\> ranking -\>
explanation

The core system must continue working if the AI API is unavailable.

## 3. Technology Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   React Router
-   Axios

### Backend

-   Python
-   FastAPI
-   Pydantic
-   PyMongo or Motor
-   JWT authentication
-   Secure password hashing

### Database

-   MongoDB
-   MongoDB Atlas compatible

### AI

-   External LLM API
-   Optional embeddings/vector search/RAG after the core system is
    stable

### Deployment

Design for: - Frontend: Vercel - Backend: Render/Railway or equivalent -
Database: MongoDB Atlas

Do not introduce unnecessary microservices, Kubernetes, Kafka, Redis, or
additional databases.

## 4. Core Features

### Must Have

1.  Registration and login
2.  User profile
3.  Scheme database
4.  Scheme CRUD
5.  Scheme search and filtering
6.  Deterministic eligibility engine
7.  Explainable eligibility results
8.  Recommendation/ranking engine
9.  Scheme detail page
10. Required documents
11. Application instructions
12. Official source URL
13. Last verified date
14. Admin management
15. Automated backend tests
16. Responsive frontend

### Should Have

17. Natural-language profile/query input
18. AI profile extraction
19. RAG-based scheme Q&A
20. Hindi/Hinglish support
21. Bookmarks/saved schemes

### Nice to Have

22. Punjabi
23. OCR document checking
24. Voice input
25. Notifications
26. Analytics

Do not sacrifice the core system to implement optional features.

## 5. Repository Structure

Use a clean monorepo:

project-root/ - frontend/ - backend/ - scripts/ - docs/ - .env.example -
.gitignore - README.md

Backend should be organized approximately as:

backend/app/ - main.py - config/ - database/ - models/ - schemas/ -
routers/ - services/ - eligibility/ - recommendation/ - ai/ - auth/ -
utils/

Keep business logic out of route handlers.

## 6. MongoDB Collections

Start with: - users - schemes

Add later if required: - bookmarks - feedback - applications -
admin/audit information

### User Document

Suggested structure:

{ "\_id": "...", "email": "...", "password_hash": "...", "role": "user",
"profile": { "age": 21, "gender": "...", "state": "Punjab", "district":
"...", "annual_income": 250000, "occupation": "student", "education":
"undergraduate", "category": "...", "employment_status": "...",
"is_student": true, "is_farmer": false, "is_disabled": false },
"created_at": "...", "updated_at": "..." }

### Scheme Document

Use a standardized but extensible structure:

{ "name": "Scheme Name", "slug": "scheme-name", "description": "...",
"category": \["education", "scholarship"\], "government": { "level":
"central", "department": "..." }, "eligibility": { "age": {"min": 18,
"max": 30}, "income": {"max": 300000}, "states": \["Punjab",
"Haryana"\], "occupations": \["student"\], "education":
\["undergraduate"\], "gender": \[\], "categories": \[\] }, "benefits":
\[\], "documents": \[\], "application": { "method": "online", "steps":
\[\], "official_url": "..." }, "source": { "department": "...",
"source_url": "...", "last_verified": "..." }, "status": "active",
"created_at": "...", "updated_at": "..." }

Common eligibility fields must remain standardized.

## 7. Eligibility Engine

Create reusable evaluators: - check_age() - check_income() -
check_state() - check_gender() - check_occupation() -
check_education() - check_category() - check_student_status() -
check_farmer_status() - check_disability_status()

Create a central function:

evaluate_scheme(user_profile, scheme)

It should return:

{ "eligible": true, "score": 92, "matched_conditions": \[\],
"failed_conditions": \[\], "missing_information": \[\] }

The score is an internal/matching score, not a probability of
eligibility.

Handle: - minimum/maximum boundaries - missing data - multiple accepted
states - multiple occupations - AND conditions - OR conditions -
optional vs required fields

The rule system must be extensible without creating a huge chain of
hard-coded if/else statements.

## 8. Recommendation Engine

First filter by eligibility/relevance.

Then rank using transparent factors such as: - eligibility match -
location relevance - occupation relevance - education relevance -
category relevance - user intent/category - benefit relevance

Call the result a "Match Score", not "percentage chance of eligibility".

Document the scoring algorithm.

## 9. Search

Support: - scheme name - description - category - state - department -
government level - keywords

Use MongoDB indexes where appropriate.

Support pagination.

## 10. API

Authentication: - POST /api/auth/register - POST /api/auth/login - GET
/api/auth/me

Users: - GET /api/users/me - PUT /api/users/me

Schemes: - GET /api/schemes - GET /api/schemes/{scheme_id} - POST
/api/schemes - PUT /api/schemes/{scheme_id} - DELETE
/api/schemes/{scheme_id}

Eligibility: - POST /api/eligibility/check - POST
/api/eligibility/recommend

Bookmarks if implemented: - POST /api/bookmarks/{scheme_id} - DELETE
/api/bookmarks/{scheme_id} - GET /api/bookmarks

AI: - POST /api/ai/parse-profile - POST /api/ai/query

Admin: - GET /api/admin/schemes - POST /api/admin/schemes - PUT
/api/admin/schemes/{scheme_id} - DELETE /api/admin/schemes/{scheme_id}

Use Pydantic request/response schemas.

## 11. Authentication and Security

Implement: - JWT authentication - secure password hashing - protected
routes - admin role authorization - input validation - CORS - safe error
handling - environment variables - no hardcoded secrets

Create `.env.example`.

Never commit API keys or MongoDB credentials.

## 12. Frontend

Pages: - Landing - Login - Register - Profile - Dashboard - Scheme
Explorer - Recommendations - Scheme Details - Natural Language Search -
Admin Dashboard

Recommendation cards should immediately show: 1. Scheme name 2. Match
score 3. Eligibility status 4. Why recommended 5. Benefits 6. Documents
7. Apply/View Official Source

Make the UI responsive and accessible.

## 13. AI

Implement AI only after the deterministic core works.

First AI capability: natural-language profile extraction.

Example: "I'm 22, studying B.Tech in Punjab and my family income is
around 2 lakh."

Expected structured output:

{ "age": 22, "state": "Punjab", "occupation": "student", "education":
"undergraduate", "annual_income": 200000 }

Validate AI output with Pydantic.

Do not blindly trust LLM output.

## 14. RAG

If time permits: - retrieve scheme information from MongoDB/vector
search - give retrieved context to the LLM - answer only from
retrieved/verified information - avoid hallucinated eligibility or
benefits - clearly say when information is unavailable

## 15. Data Strategy

Start with approximately 50 real, carefully structured schemes.

Expand to 100, 250, then approximately 500 if feasible.

Prioritize: - correctness - standardized eligibility - authoritative
source - benefits - documents - application process - last verified date

Never invent government schemes, benefits, eligibility criteria, or
application URLs.

Prefer authoritative government sources.

## 16. Testing

Create unit tests for the eligibility engine and API tests.

Test: - registration - login - invalid login - scheme CRUD - search -
age boundaries - income boundaries - state matching - occupation
matching - missing profile information - AND/OR conditions - ranking -
authorization - invalid input

The eligibility engine should have strong test coverage.

## 17. Development Priority

Build in this order:

1.  Project setup
2.  MongoDB connection
3.  FastAPI health endpoint
4.  Authentication
5.  User profile
6.  Scheme model and seed data
7.  Scheme CRUD
8.  Search/filtering
9.  Eligibility engine
10. Eligibility tests
11. Recommendation engine
12. React UI
13. AI profile extraction
14. RAG
15. Multilingual support
16. Admin dashboard
17. Security hardening
18. Deployment
19. Documentation
20. Final testing and polish

## 18. Definition of Done

The MVP is complete when a user can:

Register -\> create profile -\> search schemes -\> run eligibility -\>
receive ranked recommendations -\> see reasons -\> view scheme details
-\> see documents and official application information.

AI and multilingual features are enhancements, not prerequisites for MVP
completion.
