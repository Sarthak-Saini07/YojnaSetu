# Instructions for the Coding Agent

You are the implementation agent for the Government Scheme
Recommendation & Eligibility Platform.

## Source of Truth

Before making changes, read: 1. PROJECT_SPEC.md 2. ARCHITECTURE.md 3.
DATABASE.md 4. ELIGIBILITY_ENGINE.md 5. API_SPEC.md 6. AI_RAG.md 7.
ROADMAP.md

These files define the project's architecture and priorities.

If a requirement conflicts with another document, do not silently
choose. Explain the conflict and choose the option that preserves the
core architecture.

## Implementation Rules

1.  Work incrementally.
2.  Do not implement the entire project in one pass.
3.  Complete one phase, test it, then continue.
4.  Never replace MongoDB with another database.
5.  Never make LLM output the final eligibility decision.
6.  Keep AI optional.
7.  Keep route handlers thin.
8.  Keep business logic modular.
9.  Write tests alongside important functionality.
10. Do not hardcode secrets.
11. Do not fabricate real government data.
12. Do not invent official URLs.
13. Prefer authoritative government sources when real data is added.
14. Use clear names and type hints.
15. Avoid unnecessary dependencies.
16. Avoid overengineering.

## Required Workflow

At the beginning: - inspect the workspace - identify existing files -
read all project MD specifications - determine current implementation
status - do not overwrite existing useful work without checking it

For each phase: 1. State the goal. 2. Implement the smallest complete
increment. 3. Run relevant tests. 4. Fix failures. 5. Verify the feature
manually where practical. 6. Update documentation if architecture
changes. 7. Report what changed.

## Coding Quality

Use: - type hints - Pydantic validation - clear error handling - modular
services - reusable utilities - meaningful names - comments only where
they clarify non-obvious logic

Avoid: - giant files - giant route functions - duplicated eligibility
logic - global mutable state - hardcoded credentials - dead code

## Database

Use MongoDB cleanly.

Create indexes based on actual queries.

Keep MongoDB-specific operations in repository/database layers where
practical.

## Eligibility

Eligibility code must be deterministic.

Every eligibility decision should be explainable.

Write unit tests before or alongside complex rule functionality.

## Frontend

Build reusable components.

Handle: - loading - empty - error - success - validation

Do not expose backend implementation details to users.

## AI

AI calls belong behind an AI service abstraction.

Validate structured AI output.

Handle provider failure gracefully.

Do not log API keys or unnecessary personal information.

## Completion Reports

After each phase, report: - completed work - files changed - tests run -
test result - known issues - next recommended phase

Do not claim a feature is complete unless it has been tested.

## Definition of Done

A feature is done when: - implementation exists - relevant tests exist -
tests pass - API/UI behavior is verified - error handling exists -
documentation is updated when necessary
