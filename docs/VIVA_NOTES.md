# Academic Defense & Viva Voce Q&A Guide

This document provides concise, technically rigorous answers to 15 key questions expected during an academic project defense or viva voce examination for the **Government Scheme Recommendation System**.

---

### Q1: What core problem does this system solve?
**Answer**:
The system solves the problem of inefficient, opaque, and error-prone discovery of government welfare schemes for Indian citizens. Traditional portals rely on simple keyword search, which fails when citizens do not know government terminology. Furthermore, standard discovery platforms either force binary (Yes/No) decisions on incomplete user data or act as "black boxes" without explaining *why* a citizen is or is not eligible.

---

### Q2: What is the primary research contribution of this project?
**Answer**:
The research contribution focuses on **uncertainty-aware deterministic eligibility evaluation with strict separation of AI extraction from decision logic**. Specifically:
1. Formulating an explicit 3-state eligibility model (`ELIGIBLE`, `INSUFFICIENT INFORMATION`, `NOT ELIGIBLE`) that handles missing user data without hallucinatory assumptions.
2. Using AI *strictly* for natural-language profile extraction with mandatory human-in-the-loop review, while keeping eligibility decisions 100% deterministic and explainable.

---

### Q3: Why did you NOT use Retrieval-Augmented Generation (RAG) or Vector Databases?
**Answer**:
RAG and Vector Databases rely on semantic similarity search over embeddings. While effective for document retrieval, embeddings are inherently **probabilistic and non-deterministic**. Government eligibility rules consist of strict statutory boundaries (e.g., age caps, income limits, caste categories). RAG models frequently hallucinate benefits, confuse upper/lower bounds, or make arbitrary eligibility decisions. By separating structured field extraction (LLM) from rule evaluation (Python Boolean Engine), the architecture prevents LLM-generated information from directly determining eligibility; final eligibility decisions remain deterministic and explainable.

---

### Q4: Why use a deterministic eligibility engine instead of an end-to-end LLM?
**Answer**:
Government welfare delivery requires **accountability, auditability, and predictability**. An end-to-end LLM cannot guarantee that the exact same user profile will yield the exact same eligibility verdict twice. A deterministic rule engine guarantees 100% mathematical consistency, complete audit traces of matched/failed conditions, and precise explanation generation without risk of bias or output drift.

---

### Q5: Why did you introduce three eligibility states instead of binary True/False eligibility?
**Answer**:
In real-world citizen discovery, user profiles are frequently incomplete (e.g., a citizen might not specify their annual family income or disability status). 
- A binary engine must either **reject** the user (`NOT ELIGIBLE`) or **assume** data (`ELIGIBLE`), both of which are harmful.
- Our **3-state model** returns `INSUFFICIENT INFORMATION` when required criteria fields are missing, setting `match_score = null` and explicitly prompting the user for the missing fields.

---

### Q6: What does the AI layer do in your architecture?
**Answer**:
The AI layer is exclusively responsible for **Natural-Language Profile Extraction**. It accepts conversational user text (e.g., *"I'm a 21 year old student in Punjab with 2L family income"*), extracts candidate key-value pairs (age=21, state="Punjab", annual_income=200000), validates them against a Pydantic schema, and populates the profile form.

---

### Q7: What does the AI layer NOT do?
**Answer**:
The AI layer **NEVER**:
- Determines eligibility or ineligibility.
- Calculates or alters match scores.
- Ranks recommendations.
- Modifies or invents scheme rules.
- Overrides deterministic boolean criteria.

---

### Q8: Why did you choose FastAPI and MongoDB Atlas for the stack?
**Answer**:
- **FastAPI**: Provides asynchronous python execution (ASGI), automatic OpenAPI specification generation, native Pydantic integration for high-performance schema validation, and dependency-injection for security middleware.
- **MongoDB Atlas**: Government scheme criteria structures vary widely across departments (some have income limits, others have land-holding or occupation rules). A document-oriented NoSQL database accommodates flexible, semi-structured criteria documents without complex relational SQL migrations.

---

### Q9: How is security and role-based authorization implemented?
**Answer**:
1. **Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
2. **Password Hashing**: Passwords stored using `bcrypt` salted password hashing.
3. **Public Registration Security**: `POST /api/auth/register` strictly hardcodes `role = "user"`. Admin privilege cannot be requested during registration.
4. **Admin Authorization**: Admin routes (`POST/PUT/DELETE /api/schemes/*`) use FastAPI's `get_current_admin` dependency, raising `403 Forbidden` if a non-admin attempts access.
5. **API Key Isolation**: External LLM keys (`GEMINI_API_KEY`) reside exclusively in backend environment variables and are never sent to the client.

---

### Q10: How are scheme recommendations ranked and sorted?
**Answer**:
Recommendations use a deterministic multi-tier sorting algorithm:
1. **Tier 1 (`ELIGIBLE`)**: Ranked first, sorted internally by `match_score` descending (100% to 0%).
2. **Tier 2 (`INSUFFICIENT INFORMATION`)**: Ranked second. `match_score` is strictly `null` (never given false partial scores). Sorted by missing field count ascending.
3. **Tier 3 (`NOT ELIGIBLE`)**: Ranked last, sorted internally by partial criteria satisfaction (`match_score` descending).

---

### Q11: What does the 100% eligibility engine accuracy metric mean?
**Answer**:
The 100.00% accuracy (20/20 test cases) measures the deterministic engine's ability to execute rule trees flawlessly against the **20 curated ground-truth test cases** in `scripts/evaluation/dataset.json`. It is **NOT** a claim of 100% real-world accuracy across arbitrary unconstrained inputs, as real-world accuracy depends on scheme rule curation correctness.

---

### Q12: Why was AI field extraction accuracy only 52.22% in the evaluation report?
**Answer**:
The evaluation script was executed offline using the **rule-based regex Mock provider** (`MockLLMProvider`), which lacks context awareness for natural-language phrasing like *"artisan"* or implicit education levels. This demonstrates the necessity of the **User Review Step** before running eligibility rules and serves as an empirical baseline for comparing live LLMs like Google Gemini.

---

### Q13: How does the system handle archived or outdated schemes?
**Answer**:
Administrators can archive schemes via soft-deletion (`DELETE /api/schemes/{id}`), setting `status = "archived"`. Public endpoints filter queries strictly by `{ "status": "active" }`. The Phase 10 evaluation confirmed a **100.00% Archived Exclusion Rate**, guaranteeing that archived schemes are never recommended to citizens.

---

### Q14: What are the main limitations of the current implementation?
**Answer**:
1. **Dataset Size**: Evaluation dataset limited to 20 curated ground-truth cases.
2. **Offline AI Baseline**: Quantitative evaluation reports mock provider performance rather than extensive live LLM testing.
3. **Rule Curation Dependency**: Engine accuracy relies on accurate initial curation of scheme criteria by administrators.

---

### Q15: What future enhancements would you propose?
**Answer**:
1. **Multilingual NLP**: Native support for Hindi, Hinglish, and regional language profile extraction.
2. **Live LLM Benchmarking**: Comprehensive comparative evaluation of Gemini, GPT-4, and open-source models (Llama-3) on profile extraction.
3. **Automated Rule Verification**: Scraping official government portals to detect rule changes and alert administrators.
