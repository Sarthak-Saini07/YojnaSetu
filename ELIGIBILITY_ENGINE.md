# Eligibility Engine Specification

## Purpose

The eligibility engine is the authoritative decision layer for whether a
user satisfies structured scheme eligibility criteria.

## Principles

-   Deterministic
-   Explainable
-   Testable
-   Extensible
-   Independent from LLMs

## Evaluators

Implement separate functions for common fields:

-   age
-   income
-   state
-   district if needed
-   gender
-   occupation
-   education
-   category
-   student status
-   farmer status
-   disability status

Each evaluator should return a structured result rather than only
True/False.

Example:

{ "field": "income", "status": "passed", "message": "Annual income is
within the scheme limit." }

Possible statuses: - passed - failed - missing - not_applicable

## Central Evaluation

evaluate_scheme(profile, scheme)

Expected output:

{ "eligible": true, "match_score": 94, "matched_conditions": \[\],
"failed_conditions": \[\], "missing_information": \[\],
"evaluation_details": \[\] }

## Missing Information

Do not automatically classify missing data as failure unless the field
is required to establish eligibility.

Example:

If income is required but user has not entered income: status = missing

The frontend should tell the user what information is needed.

## Boundary Rules

Be explicit about inclusive/exclusive comparisons.

For example: - min age means age \>= min - max age means age \<= max -
max income means income \<= max

These rules must have unit tests.

## AND / OR Conditions

The engine should support compound conditions.

Do not encode every scheme as a custom Python function.

Prefer structured rule representations that can be interpreted
generically.

## Explanation

Every decision should be explainable.

Example:

Eligible: - Age requirement satisfied. - Income requirement satisfied. -
State requirement satisfied.

Not eligible: - Income exceeds the maximum allowed amount.

Missing: - Annual income is required to determine eligibility.

## Match Score

The score should represent profile/rule matching, not probability.

Never display: "94% chance of eligibility."

Prefer: "94 Match Score"

## Testing Requirements

At minimum test: - exact minimum age - exact maximum age - one unit
below/above boundaries - exact income limit - one rupee above income
limit - accepted state - rejected state - accepted occupation - missing
fields - AND - OR - empty rules - malformed rules
