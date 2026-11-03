# Three-Month Development Roadmap

## Weeks 1-2: Foundation

### Week 1

-   inspect repository
-   initialize monorepo
-   configure Git
-   create FastAPI app
-   create React/Vite app
-   configure environment variables
-   establish MongoDB connection
-   create health endpoint

### Week 2

-   finalize MongoDB schema
-   create Pydantic schemas
-   create seed script
-   insert first 10-20 schemes
-   build basic API structure

## Weeks 3-4: Backend

### Week 3

-   registration
-   login
-   password hashing
-   JWT
-   user profile APIs

### Week 4

-   scheme CRUD
-   scheme details
-   search
-   filtering
-   pagination
-   MongoDB indexes

## Weeks 5-6: Eligibility

### Week 5

-   implement evaluators
-   age
-   income
-   state
-   occupation
-   education
-   gender/category as needed

### Week 6

-   compound rules
-   AND/OR
-   missing data
-   explanations
-   extensive unit tests

At the end of Week 6, the core application must work without AI.

## Weeks 7-8: Recommendations + Frontend

### Week 7

-   ranking engine
-   match scoring
-   recommendation API
-   recommendation tests

### Week 8

-   landing page
-   auth pages
-   profile page
-   scheme explorer
-   recommendation page
-   scheme details

## Weeks 9-10: AI

### Week 9

-   natural-language input
-   structured profile extraction
-   Pydantic validation
-   connect extracted profile to eligibility engine

### Week 10

-   grounded Q&A
-   RAG if feasible
-   AI explanations
-   graceful AI failure handling

## Week 11: Admin + Multilingual

-   admin dashboard
-   scheme verification/update
-   Hindi/Hinglish support
-   bookmarks if time permits
-   improve data management

Punjabi, OCR, voice are optional.

## Week 12: Finalization

-   security audit
-   backend tests
-   frontend testing
-   edge cases
-   performance checks
-   deployment
-   documentation
-   demo data
-   presentation screenshots
-   final cleanup

Do not introduce major features during the final week.

## Priority Rule

If behind schedule, cut in this order: 1. Voice 2. OCR 3. Punjabi 4.
Advanced RAG 5. Advanced analytics

Never cut: - database - eligibility engine - recommendations -
explanations - core UI - tests
