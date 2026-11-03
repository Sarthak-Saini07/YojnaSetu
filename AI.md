# AI and RAG Specification

## Goal

AI enhances natural-language interaction but does not control
eligibility.

## AI Responsibilities

Allowed: - extract profile attributes from text - understand
natural-language intent - normalize user terminology - generate
explanations based on verified data - answer grounded questions about
stored scheme information

Not allowed: - invent eligibility criteria - invent benefits - invent
application links - override deterministic eligibility results - make
unsupported legal/government claims

## Profile Extraction

Input: "I'm 22, a B.Tech student from Punjab and my family income is 2.5
lakh."

Output:

{ "age": 22, "state": "Punjab", "occupation": "student", "education":
"undergraduate", "annual_income": 250000 }

Use structured output and validate it with Pydantic.

If the model is uncertain, return the field as unresolved rather than
guessing.

## RAG

RAG should retrieve scheme information from the project's
database/vector index.

Suggested flow:

User Query -\> Query understanding -\> Retrieval -\> Relevant scheme
context -\> Grounded prompt -\> LLM -\> Response

The prompt should explicitly require the model to use only supplied
scheme information.

## AI Failure

If the AI provider fails: - return a useful error - allow the user to
use structured forms and normal search

## Privacy

Do not send unnecessary personal information to external AI services.

Only send the minimum fields required for the requested AI operation.

Do not log sensitive user data or full prompts unnecessarily.

## Future Multilingual Support

Support: - English first - Hindi/Hinglish next - Punjabi only after the
core system is stable

Normalize common terms before eligibility evaluation.
