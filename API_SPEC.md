# API Specification

Base URL: `/api`

## Authentication

### POST /auth/register

Request: { "email": "user@example.com", "password": "..." }

Response: { "message": "Registration successful" }

### POST /auth/login

Request: { "email": "user@example.com", "password": "..." }

Response: { "access_token": "...", "token_type": "bearer" }

### GET /auth/me

Returns authenticated user information.

## User Profile

### GET /users/me

Returns the authenticated user's profile.

### PUT /users/me

Updates the authenticated user's profile.

## Schemes

### GET /schemes

Query parameters: - search - category - state - government_level -
page - limit

### GET /schemes/{scheme_id}

Returns one scheme.

### POST /schemes

Admin only.

### PUT /schemes/{scheme_id}

Admin only.

### DELETE /schemes/{scheme_id}

Admin only. Prefer soft deletion/deactivation when appropriate.

## Eligibility

### POST /eligibility/check

Request: { "profile": { "age": 21, "state": "Punjab", "annual_income":
250000, "occupation": "student" }, "scheme_id": "..." }

Response should contain: - eligible - match_score - matched_conditions -
failed_conditions - missing_information

### POST /eligibility/recommend

Request: { "profile": {...}, "categories": \["education"\] }

Response: { "results": \[ { "scheme": {...}, "eligible": true,
"match_score": 94, "reasons": \[...\] } \] }

## AI

### POST /ai/parse-profile

Request: { "text": "I'm 21 and studying B.Tech in Punjab..." }

Response: { "profile": {...}, "unresolved_fields": \[\] }

### POST /ai/query

Used for natural-language scheme questions.

AI responses must be grounded in available scheme data.

## Security

Protected endpoints must require JWT.

Admin endpoints require admin role.

Do not return: - password_hash - secret keys - internal database errors
