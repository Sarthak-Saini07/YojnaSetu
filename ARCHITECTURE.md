# System Architecture

## Overview

The application is a modular monolith.

React frontend communicates with FastAPI through REST APIs. FastAPI owns
business logic and communicates with MongoDB. AI services are optional
integrations behind a dedicated service layer.

## Architecture

Browser \| v React + Vite \| \| HTTPS REST v FastAPI \| +-- Auth Service
+-- User Service +-- Scheme Service +-- Eligibility Engine +--
Recommendation Engine +-- Search Service +-- AI Service +-- Admin
Service \| v MongoDB Atlas

Optional:

AI Service \| +-- LLM +-- Embeddings +-- Vector search/RAG

## Architectural Rules

1.  Route handlers must remain thin.
2.  Business logic belongs in services/modules.
3.  Eligibility logic must not depend on an LLM.
4.  AI failures must not break basic eligibility functionality.
5.  Database access should be isolated.
6.  Validate API input/output with Pydantic.
7.  Never expose passwords, tokens, or secrets.
8.  Use environment variables.
9.  Prefer simple synchronous architecture unless async materially
    helps.
10. Avoid premature microservices.

## Request Flow: Structured Profile

Frontend -\> POST /api/eligibility/recommend -\> FastAPI validates
request -\> Scheme service retrieves candidate schemes -\> Eligibility
engine evaluates each scheme -\> Recommendation engine ranks results -\>
API returns structured response -\> React renders recommendation cards

## Request Flow: Natural Language

Frontend -\> POST /api/ai/parse-profile -\> AI service extracts
structured fields -\> Pydantic validates output -\> Eligibility engine
evaluates profile -\> Recommendation engine ranks schemes -\> Optional
AI explanation -\> Frontend displays results

## Request Flow: RAG

User query -\> AI service -\> retrieve relevant scheme documents -\>
construct grounded prompt -\> LLM -\> validate/format answer -\>
frontend

The answer must not invent government scheme information.

## Failure Handling

If AI is unavailable: - structured profile flow must still work - normal
search must still work - eligibility must still work

If MongoDB is unavailable: - return a controlled service error - never
expose raw stack traces to users

## Deployment

Frontend: Vercel or equivalent

Backend: Render/Railway or equivalent

Database: MongoDB Atlas

Keep configuration environment-specific.
