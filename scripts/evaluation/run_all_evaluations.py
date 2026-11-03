import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime

# Add workspace root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from scripts.evaluation.evaluate_eligibility import run_eligibility_evaluation, CLASSES
from scripts.evaluation.evaluate_ai_extraction import run_ai_extraction_evaluation
from scripts.evaluation.evaluate_recommendations import run_recommendation_evaluation

RESULTS_PATH = Path(__file__).resolve().parent / "results.json"


async def main():
    print("=========================================================================")
    print("     GOVERNMENT SCHEME RECOMMENDATION SYSTEM - RESEARCH EVALUATION      ")
    print("=========================================================================\n")

    # 1. Deterministic Eligibility Engine Evaluation
    print("1. Running Deterministic Eligibility Engine Evaluation...")
    eligibility_res = run_eligibility_evaluation()

    # 2. AI Profile Extraction Evaluation
    print("2. Running AI Natural-Language Profile Extraction Evaluation...")
    ai_res = await run_ai_extraction_evaluation()

    # 3. Deterministic Recommendation Engine Ranking Evaluation
    print("3. Running Recommendation Engine Ranking Monotonicity Evaluation...")
    rec_res = run_recommendation_evaluation()

    # Assemble comprehensive results object with required metadata
    results = {
        "timestamp": datetime.now().isoformat(),
        "evaluation_type": "curated_ground_truth",
        "dataset_metadata": {
            "dataset_size": eligibility_res["dataset_size"],
            "eligible_cases": eligibility_res["eligible_cases"],
            "not_eligible_cases": eligibility_res["not_eligible_cases"],
            "insufficient_information_cases": eligibility_res["insufficient_information_cases"],
        },
        "eligibility_evaluation": eligibility_res,
        "ai_extraction_evaluation": ai_res,
        "recommendation_ranking_evaluation": rec_res,
        "disclaimers": {
            "eligibility_engine": "100% accuracy applies ONLY to this 20-case curated ground-truth evaluation dataset and is NOT a claim of real-world 100% accuracy across arbitrary unconstrained inputs.",
            "ai_extraction": "52.22% field extraction accuracy and 80.00% end-to-end agreement are measured on the MOCK rule-based provider and do NOT represent live Google Gemini API performance."
        }
    }

    # Save to JSON
    with open(RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    # Print Executive Summary & Metrics Report
    print("\n=========================================================================")
    print("                         EVALUATION REPORT SUMMARY                       ")
    print("=========================================================================")
    print(f"Evaluation Type:             curated_ground_truth")
    print(f"Dataset Size:                {eligibility_res['dataset_size']} ground-truth test cases")
    print(f"  - Eligible Cases:          {eligibility_res['eligible_cases']}")
    print(f"  - Not Eligible Cases:      {eligibility_res['not_eligible_cases']}")
    print(f"  - Insufficient Info Cases: {eligibility_res['insufficient_information_cases']}")
    print("-------------------------------------------------------------------------")
    print(f"Deterministic Engine Acc:    {eligibility_res['accuracy'] * 100:.2f}%")
    print(f"Deterministic Macro F1:      {eligibility_res['macro_metrics']['f1']}")
    print(f"AI Extraction Provider:      {ai_res['provider_used']} (Mock Provider={ai_res['is_mock_provider']})")
    print(f"AI Field Extraction Acc:     {ai_res['field_extraction_accuracy'] * 100:.2f}%")
    print(f"AI Missing Field Acc:        {ai_res['missing_field_detection_accuracy'] * 100:.2f}%")
    print(f"AI End-to-End Agreement:     {ai_res['eligibility_result_agreement'] * 100:.2f}%")
    print(f"Recommendation Tier Order:   {rec_res['tier_preservation_rate'] * 100:.2f}% compliance")
    print(f"Archived Scheme Exclusion:   {rec_res['archived_exclusion_rate'] * 100:.2f}% compliance")
    print("=========================================================================\n")

    print("RESEARCH DISCLAIMERS & SCOPE:")
    print("1. " + results["disclaimers"]["eligibility_engine"])
    print("2. " + results["disclaimers"]["ai_extraction"])
    print("-------------------------------------------------------------------------\n")

    # Format 3x3 Confusion Matrix ASCII Table
    print("3x3 CONFUSION MATRIX (Deterministic Eligibility Engine):")
    print("-------------------------------------------------------------------------")
    print(f"{'Actual \\ Predicted':<25} | {'ELIGIBLE':<12} | {'NOT ELIGIBLE':<14} | {'INSUFFICIENT INFO':<18}")
    print("-------------------------------------------------------------------------")
    cm = eligibility_res["confusion_matrix"]
    for row_cls in CLASSES:
        line = f"{row_cls:<25} | "
        line += " | ".join(f"{cm[row_cls][col_cls]:<12}" for col_cls in CLASSES)
        print(line)
    print("-------------------------------------------------------------------------\n")

    # Per-Class Precision / Recall / F1
    print("PER-CLASS METRICS:")
    print("-------------------------------------------------------------------------")
    print(f"{'Class':<25} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-------------------------------------------------------------------------")
    for cls_name, m in eligibility_res["per_class_metrics"].items():
        print(f"{cls_name:<25} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1']:<10.4f}")
    print("-------------------------------------------------------------------------\n")

    print(f"Full evaluation results exported to: {RESULTS_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
