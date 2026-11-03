# Phase 10 System Evaluation & Validation Report

This report presents the empirical evaluation methodology, experimental setup, quantitative results, confusion matrices, and limitations of the **Government Scheme Recommendation System**, conducted during Phase 10.

---

## 1. Evaluation Setup & Dataset Methodology

To validate system performance independently of model training or internal logic bias, a curated ground-truth evaluation dataset was constructed in `scripts/evaluation/dataset.json`.

### Dataset Properties & Independence
- **Dataset Size**: 20 curated citizen profiles (`dataset_size = 20`).
- **Ground-Truth Determination**: Every expected eligibility status (`ELIGIBLE`, `NOT ELIGIBLE`, `INSUFFICIENT INFORMATION`) and expected missing field list was **manually annotated** prior to evaluation.
- **System Independence**: Zero ground-truth values were generated or synthesized by the system under test (`evaluation_type = curated_ground_truth`).

### Dataset Composition Breakdown

| Class / Category | Count | Percentage | Description / Boundary Conditions Covered |
| :--- | :---: | :---: | :--- |
| **ELIGIBLE** | 10 | 50.0% | Complete user profiles satisfying all scheme criteria (age, income, state, category, occupation). |
| **NOT ELIGIBLE** | 8 | 40.0% | Profiles failing specific criteria (income exceeding cap, state restriction mismatch, age upper/lower bound violation, category mismatch). |
| **INSUFFICIENT INFORMATION** | 2 | 10.0% | Incomplete user profiles missing required demographic attributes (e.g., missing income, missing category/caste). |
| **Total Curated Dataset** | **20** | **100.0%** | Comprehensive boundary coverage across central and state schemes. |

---

## 2. Deterministic Eligibility Engine Evaluation

The deterministic eligibility engine was evaluated against the 20 curated ground-truth test cases.

### Measured Quantitative Performance

| Metric | Measured Score | Details / Interpretation |
| :--- | :---: | :--- |
| **Accuracy** | **100.00% (20/20)** | Correctly classified all 20 ground-truth test cases. |
| **Macro Precision** | **1.0000** | Perfect precision across all 3 outcome classes. |
| **Macro Recall** | **1.0000** | Perfect recall across all 3 outcome classes. |
| **Macro F1-Score** | **1.0000** | Balanced F1 score indicating flawless rule execution. |

### Per-Class Performance Metrics

| Target Class | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1-Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ELIGIBLE** | 10 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| **NOT ELIGIBLE** | 8 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| **INSUFFICIENT INFORMATION** | 2 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |

### Multi-Class Confusion Matrix

```
                          PREDICTED STATUS
               ELIGIBLE  NOT ELIGIBLE  INSUFFICIENT INFO
ACTUAL  ELIGIBLE        10            0                  0
STATUS  NOT ELIGIBLE     0            8                  0
        INSUFFICIENT     0            0                  2
```

> [!IMPORTANT]
> **Dataset Scope Disclaimer**:
> 100% accuracy applies **ONLY** to this 20-case curated ground-truth evaluation dataset and is **NOT** a claim of real-world 100% accuracy across arbitrary unconstrained inputs or unverified external scheme datasets.

---

## 3. Recommendation Ranking Engine Evaluation

The recommendation engine was evaluated to ensure strict tier compliance and deterministic score ordering.

### Measured Ranking Metrics

| Ranking Property | Measured Score | Evaluation Standard |
| :--- | :---: | :--- |
| **Tier Order Preservation Rate** | **100.00% (20/20)** | Schemes strictly ordered by Tier 1 (`ELIGIBLE`), Tier 2 (`INSUFFICIENT INFORMATION`), Tier 3 (`NOT ELIGIBLE`). Zero Tier 3 schemes ranked above Tier 1 schemes. |
| **Match Score Monotonicity Rate**| **100.00% (20/20)** | Schemes within the same tier strictly sorted in descending order of `match_score`. |
| **Archived Exclusion Rate** | **100.00% (20/20)** | Soft-deleted / archived schemes (`status = 'archived'`) strictly excluded from recommendation sets. |

---

## 4. AI Profile Extraction Evaluation (Mock Provider)

Natural-language extraction performance was evaluated by passing test prompt strings into the extraction interface and comparing extracted Pydantic fields against ground-truth profiles.

### Measured AI Metrics (`provider_used = mock`)

| AI Evaluation Metric | Measured Score | Details / Context |
| :--- | :---: | :--- |
| **Field Extraction Accuracy** | **52.22% (94/180 fields)** | Accuracy across 9 discrete profile fields over 20 cases. |
| **Missing Field Detection Accuracy** | **100.00%** | System correctly flagged un-extracted mandatory fields. |
| **End-to-End Agreement Rate** | **80.00% (16/20 cases)** | Final eligibility outcome after AI extraction agreed with ground-truth eligibility. |

> [!WARNING]
> **Mock Provider Disclaimer**:
> The 52.22% field extraction accuracy and 80.00% end-to-end agreement were measured using the offline **Mock rule-based regex provider** (`MockLLMProvider`). These figures do **NOT** represent Google Gemini API (`GeminiLLMProvider`) performance.

### Failure Analysis of Mock Extraction

The Mock provider failed on 4 specific test cases (TC-11, TC-16, TC-18, TC-20) due to unhandled natural-language phrasing:
1. **TC-11 ("artisan in Uttar Pradesh")**: Mock regex lacked pattern matching for the occupation phrase `"artisan"` and default education/caste inference.
2. **TC-16 ("self employed shop owner")**: Extracted occupation as `"employed"` instead of `"self_employed"`, triggering a criteria rule mismatch.
3. **TC-18 & TC-20**: Failed to infer underlying educational levels and category defaults from short phrases.

### Architectural Significance of User Review Step
Because field extraction accuracy of lightweight/mock extraction is imperfect (52.22%), the architecture mandates a **User Review Modal Step**. Citizens inspect and edit extracted fields before eligibility rules run. This human-in-the-loop design prevents AI extraction errors from causing false eligibility rejections.

---

## 5. Evaluation Limitations & Validity Constraints

1. **Curated Dataset Size**: The evaluation dataset consists of 20 hand-crafted test cases. While carefully constructed to test boundary conditions, it does not capture the full diversity of real-world citizen query phrasing.
2. **Mock AI Environment**: Evaluation was conducted offline using `MockLLMProvider` to ensure deterministic execution without external network latency or API billability. Live LLM performance was verified qualitatively separately.
3. **Static Rules Snapshot**: Test schemes reflect verified rules as of September 2026. Real-world policy updates require administrative criteria maintenance.
