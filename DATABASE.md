# MongoDB Database Specification

## Collections

Initial: - users - schemes

Optional: - bookmarks - feedback - applications - audit_logs

## Users

Required: - email - password_hash - role - profile - created_at -
updated_at

Create a unique index on normalized email.

## Schemes

Required: - name - slug - description - category - government -
eligibility - benefits - documents - application - source - status -
timestamps

## Data Quality

Every real scheme should include: - authoritative source URL -
department - last verified date

Never fabricate source URLs.

## Indexes

Consider indexes for: - users.email - schemes.slug - schemes.status -
schemes.category - schemes.government.level -
schemes.eligibility.states - searchable scheme fields

Only add indexes that support real query patterns.

## Seed Data

Create a seed script.

Development should begin with a small verified/sample dataset.

Do not hardcode scheme data inside route handlers.

## Validation

Validate important fields before writing to MongoDB.

Avoid storing inconsistent representations such as: - "Punjab" -
"punjab" - "PUNJAB"

Normalize values at the application boundary.

## Dates

Store timestamps in UTC.

Display dates in the user's local timezone in the frontend.

## Security

MongoDB credentials must only come from environment variables.

Never commit `.env`.
