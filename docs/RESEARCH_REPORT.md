# Uncertainty-Aware Explainable Government Scheme Recommendation via Deterministic Rule Evaluation and Separated AI Profile Extraction

**Abstract**  
Accessing government welfare schemes in developing nations remains challenging due to complex eligibility criteria, fragmented information, and low digital literacy among citizens. Existing discovery platforms rely primarily on keyword search or black-box probabilistic recommendations, often misclassifying citizens with incomplete profiles or failing to provide transparent explanations. This paper presents an uncertainty-aware, explainable recommendation architecture that decouples natural-language profile extraction from statutory eligibility determination. The proposed system introduces a novel **three-state eligibility model** (`ELIGIBLE`, `INSUFFICIENT INFORMATION`, `NOT ELIGIBLE`) evaluated deterministically using structured Boolean rule trees. Natural language input is parsed by Large Language Models (LLMs) into structured Pydantic schemas, subjected to mandatory citizen review, and then evaluated by an offline rule engine. Empirical evaluation on a curated ground-truth dataset of 20 representative citizen profiles demonstrates 100.00% eligibility classification accuracy and tier-preservation rate on the benchmark dataset; the architecture prevents LLM-generated information from directly determining eligibility; final eligibility decisions remain deterministic and explainable.

---

## 1. Introduction & Research Problem

### 1.1 Background & Context
Government welfare initiatives span financial grants, agricultural subsidies, educational scholarships, healthcare support, and pension schemes. In countries like India, thousands of central and state government schemes exist concurrently. However, citizen enrollment rates remain disproportionately low relative to target populations.

### 1.2 The Research Problem
Citizen discovery of government schemes is hampered by four fundamental barriers:
1. **Language and Terminology Barriers**: Citizens state their circumstances in plain natural language (e.g., *"I run a small shop in Lucknow"*), whereas government portals require rigid official nomenclature (e.g., *"Self-employed, Micro-enterprise, Urban, Uttar Pradesh"*).
2. **Failure of Keyword-Based Search**: Traditional keyword search indexes titles and descriptions. Searching *"money for college"* fails to match schemes titled *"Post-Matric Scholarship for Scheduled Caste Students"*.
3. **The Incomplete Information Problem**: Citizens rarely provide all required demographic details at once. Existing binary systems (`Eligible` vs `Not Eligible`) either falsely reject citizens due to missing inputs or make hallucinatory assumptions.
4. **Lack of Explainability**: Citizens who are denied benefits or recommended specific schemes receive no explicit breakdown of which exact criteria were met, failed, or left unverified.

---

## 2. Research Objectives & Contributions

### 2.1 Research Objectives
1. **Deterministic Eligibility Evaluation**: Implement a formal Boolean rule engine that guarantees 100% mathematical consistency without probabilistic variance.
2. **Three-State Uncertainty Modeling**: Formulate a tri-state classification system that explicitly isolates missing data under an `INSUFFICIENT INFORMATION` outcome with `match_score = null`.
3. **Decoupled AI Extraction Layer**: Utilize Large Language Models strictly for natural-language profile parsing, enforcing mandatory human review before eligibility execution.
4. **Transparent Multi-Tier Recommendation**: Rank schemes using strict eligibility tier prioritization followed by rule-satisfaction scoring.

### 2.2 Research Gap & Novelty Distinction
Existing commercial and government portals (such as *myScheme* or generic chatbot interfaces) fall into two categories: static filter forms or end-to-end LLM chatbots. 

> [!NOTE]
> **Research Contribution Definition**:
> This work does **NOT** claim that the concept of scheme discovery itself is novel. Rather, the novelty lies in the **uncertainty-aware 3-state eligibility model** and the **architectural separation of AI extraction from statutory decision-making**.

| Feature / Dimension | Existing Portals (myScheme, etc.) | Generic LLM Chatbots / RAG | Our Proposed System |
| :--- | :--- | :--- | :--- |
| **Input Mechanism** | Static drop-down forms | Natural language chat | Natural language + Structured form |
| **Missing Data Handling** | Silently ignored or default values | Hallucinates missing details | Explicit `INSUFFICIENT INFORMATION` state |
| **Decision Mechanism** | Hardcoded SQL/If-Else filters | Probabilistic LLM generation | Deterministic Pydantic Rule Engine |
| **AI Hallucination Risk** | N/A (No AI) | High (Invents benefits/rules) | Zero (AI isolated from rules) |
| **Explainability** | Minimal / Generic text | Unpredictable generated text | Audit tree of matched/failed rules |

---

## 3. System Architecture & Control Flow

The system employs a 3-tier architecture comprising a React SPA frontend, FastAPI REST backend, MongoDB Atlas document database, and an isolated LLM provider abstraction layer.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                      React Single Page Application (Vite)                         |
+-----------------------------------------------------------------------------------+
                                         |  HTTP / REST (JWT Auth)
                                         v
+-----------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                     |
|                            FastAPI ASGI Application                               |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  | Auth & User Service |   | Scheme CRUD Service |   | AI Extraction Service   |  |
|  +---------------------+   +---------------------+   +-------------------------+  |
|                                                                   |               |
|                                                                   v               |
|  +-----------------------------------------------+   +-------------------------+  |
|  |  Deterministic Eligibility Rule Engine        |   | External LLM Provider   |  |
|  |  (3-State: ELIGIBLE / INSUFFICIENT / NOT)     |   | (Gemini / Mock Adapter) |  |
|  +-----------------------------------------------+   +-------------------------+  |
|                         |                                                         |
|                         v                                                         |
|  +-----------------------------------------------+                                |
|  |  Deterministic Multi-Tier Recommender Engine  |                                |
|  +-----------------------------------------------+                                |
+-----------------------------------------------------------------------------------+
                                         |  PyMongo Drivers
                                         v
+-----------------------------------------------------------------------------------+
|                                 DATA LAYER                                        |
|                          MongoDB Atlas Document DB                                |
+-----------------------------------------------------------------------------------+
```

### Decoupled AI Pipeline
Natural language text flows through privacy sanitization, LLM parsing, Pydantic validation, and **mandatory citizen review** before reaching the rule engine:

$$\text{Natural Language Text} \xrightarrow{\text{Sanitize}} \text{LLM Provider} \xrightarrow{\text{Pydantic Schema}} \text{User Confirmation Modal} \xrightarrow{\text{Confirmed Profile}} \text{Rule Engine}$$

---

## 4. Eligibility Engine & Uncertainty Modeling

### 4.1 Supported Eligibility Criteria
The deterministic engine evaluates 10 core demographic and socio-economic dimensions:
1. `age` (Min/Max integer range)
2. `gender` (Allowed strings)
3. `state` (State-level vs Central eligibility)
4. `annual_income` (Maximum family income ceiling)
5. `occupation` (Allowed occupations)
6. `education` (Minimum/exact educational attainment)
7. `category` (Caste/social category: General, OBC, SC, ST)
8. `is_student` (Boolean requirement)
9. `is_farmer` (Boolean requirement)
10. `is_disabled` (Boolean requirement)

### 4.2 Formal Three-State Logic
Let $\mathcal{P}$ represent the user profile attributes and $\mathcal{C}_s$ represent the required criteria set for scheme $s$.

$$\text{Status}(\mathcal{P}, \mathcal{C}_s) = \begin{cases} \text{INSUFFICIENT INFORMATION}, & \text{if } \exists k \in \text{Required}(\mathcal{C}_s) \text{ such that } \mathcal{P}[k] = \text{null} \\ \text{ELIGIBLE}, & \text{if } \forall k \in \text{Required}(\mathcal{C}_s), \mathcal{P}[k] \text{ satisfies } \mathcal{C}_s[k] \\ \text{NOT ELIGIBLE}, & \text{otherwise} \end{cases}$$

### 4.3 Match Score Formulation
The `match_score` quantifies the proportion of evaluated criteria satisfied. It is a **rule-satisfaction metric**, NOT a probability score.
- For `ELIGIBLE`: $\text{match\_score} = 1.00$ ($100\%$).
- For `NOT ELIGIBLE`: $\text{match\_score} = \frac{|\text{Satisfied Criteria}|}{|\text{Evaluated Criteria}|} \in [0.00, 0.99]$.
- For `INSUFFICIENT INFORMATION`: $\text{match\_score} = \text{null}$ (Preserved strictly to avoid misleading citizens).

---

## 5. Recommendation Engine & Tier Ranking

Recommendations are organized into three discrete tiers to prevent ineligible schemes from outranking eligible ones:

1. **Tier 1 (`ELIGIBLE`)**: Primary tier. Sorted by `match_score` descending.
2. **Tier 2 (`INSUFFICIENT INFORMATION`)**: Secondary tier. `match_score = null`. Sorted by ascending count of missing fields.
3. **Tier 3 (`NOT ELIGIBLE`)**: Tertiary tier. Sorted by `match_score` descending to show near-eligible schemes for transparency.

---

## 6. AI Profile Extraction Layer

### 6.1 Provider Abstraction
The system defines a unified `BaseLLMProvider` interface with two implementations:
- `GeminiLLMProvider`: Interfaces with Google Gemini REST API (`gemini-1.5-flash`) using JSON schema mode.
- `MockLLMProvider`: Offline regex-based provider for offline testing and evaluation baselines.

### 6.2 Privacy & Security Safeguards
Before passing prompts to external LLMs, the `AIService` executes privacy sanitization, stripping authentication tokens, passwords, and sensitive identifiers.

---

## 7. Database Design & API Specification

### 7.1 Database Collections (MongoDB Atlas)
- **`users`**: Contains credentials (`password_hash` via bcrypt), `role` (`"user"` or `"admin"`), and nested profile document. Indexed on `email`.
- **`schemes`**: Contains title, category, eligibility criteria rules, benefits, source URL, and `status` (`"active"` or `"archived"`). Indexed on `slug` and `status`.
- **`bookmarks`**: Links `user_id` and `scheme_id` with compound unique indexing.

### 7.2 Core API Endpoints

| Method | Route | Auth Required | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Registers citizen profile (hardcoded `role: "user"`). |
| `POST` | `/api/auth/login` | Public | Authenticates citizen and issues JWT. |
| `GET` | `/api/schemes` | Public | Lists all active schemes (excludes archived). |
| `POST` | `/api/eligibility/check` | Public/User | Evaluates 3-state eligibility for a specific scheme. |
| `POST` | `/api/eligibility/recommend` | Public/User | Returns 3-tier sorted scheme recommendations. |
| `POST` | `/api/ai/parse-profile` | Public/User | Extracts structured profile JSON from natural language. |
| `POST` | `/api/schemes` | Admin Only | Creates new government scheme (`role == "admin"`). |
| `DELETE`| `/api/schemes/{id}` | Admin Only | Soft-deletes/archives scheme (`status = "archived"`). |

---

## 8. Security & Access Control Architecture

1. **Token Security**: Standard Bearer JWT with HMAC-SHA256 signature verification.
2. **Password Safety**: Salted bcrypt password hashing.
3. **Admin Protection**: Mandatory dependency injection (`get_current_admin`) enforcing `HTTP 403 Forbidden` on unauthorized administrative access.
4. **Soft-Delete Scheme Handling**: Archived schemes are strictly excluded from public listing and recommendation queries.

---

## 9. Empirical Evaluation & Quantitative Results

Evaluation was conducted in Phase 10 using a reproducible dataset of 20 hand-crafted ground-truth test cases (`scripts/evaluation/dataset.json`).

### 9.1 Eligibility Engine Evaluation Results

- **Dataset Size**: 20 ground-truth cases (10 ELIGIBLE, 8 NOT ELIGIBLE, 2 INSUFFICIENT INFORMATION).
- **Accuracy**: **100.00% (20/20)**
- **Macro Precision**: **1.0000**
- **Macro Recall**: **1.0000**
- **Macro F1-Score**: **1.0000**

#### Multi-Class Confusion Matrix
```
                          PREDICTED STATUS
               ELIGIBLE  NOT ELIGIBLE  INSUFFICIENT INFO
ACTUAL  ELIGIBLE        10            0                  0
STATUS  NOT ELIGIBLE     0            8                  0
        INSUFFICIENT     0            0                  2
```

> [!IMPORTANT]
> **Dataset Scope Disclaimer**:
> 100% accuracy applies **ONLY** to this 20-case curated ground-truth evaluation dataset and is **NOT** a claim of real-world 100% accuracy across arbitrary unconstrained inputs.

### 9.2 Recommendation Ranking Results
- **Tier Order Preservation Rate**: **100.00%**
- **Score Monotonicity Rate**: **100.00%**
- **Archived Exclusion Rate**: **100.00%**

### 9.3 AI Profile Extraction Evaluation Results (`provider_used = mock`)
- **Field Extraction Accuracy**: **52.22%** (94/180 fields)
- **Missing Field Detection Accuracy**: **100.00%**
- **End-to-End Status Agreement Rate**: **80.00%** (16/20 cases)

> [!WARNING]
> **Mock Provider Disclaimer**:
> The 52.22% field extraction accuracy and 80.00% end-to-end agreement were measured using the offline **Mock rule-based provider** and do **NOT** represent Google Gemini API performance.

---

## 10. Discussion, Limitations & Future Work

### 10.1 Discussion
The empirical results validate the core hypothesis: **the architecture prevents LLM-generated information from directly determining eligibility; final eligibility decisions remain deterministic and explainable while retaining conversational usability**. The 100% missing field detection accuracy ensures that even when the AI fails to extract complex fields, the user is safely guided to the `INSUFFICIENT INFORMATION` review state rather than receiving incorrect eligibility verdicts.

### 10.2 System Limitations
1. **Curated Evaluation Size**: Benchmark dataset is limited to 20 curated test cases.
2. **Offline AI Evaluation Baseline**: AI quantitative evaluation relies on rule-based mock extraction.
3. **Manual Scheme Rule Maintenance**: Engine accuracy relies on administrators keeping scheme rules up-to-date.

### 10.3 Future Work
1. **Broad Live LLM Benchmark**: Evaluate Google Gemini, GPT-4, and open-weight models (Llama-3) on complex phrasing.
2. **Multilingual NLP Support**: Extend extraction to Hindi, Hinglish, and regional Indian languages.
3. **Automated Scraping Verification**: Implement background scrapers to detect official scheme rule updates.

---

## References & Verification Notes
*Note: External concepts and standards cited below are marked for verification against official documentation.*
- [VERIFICATION NEEDED] Direct Government Welfare Delivery Framework Guidelines (Ministry of Electronics & Information Technology, Govt. of India).
- [VERIFICATION NEEDED] OpenAPI Specification v3.0.3 & Pydantic v2 Schema Standard Documentation.
- [VERIFICATION NEEDED] NIST Special Publication 800-63B: Digital Identity Guidelines (Authentication and Lifecycle Management).
