# Government Scheme Recommendation System

An uncertainty-aware, explainable government scheme recommendation platform for Indian citizens.

[![Backend Tests](https://img.shields.io/badge/Backend%20Pytest-40%20PASSED-success)](#running-automated-tests)
[![Frontend Build](https://img.shields.io/badge/Frontend%20Build-Vite%20PASSED-success)](#2-frontend-setup)
[![Evaluation Benchmark](https://img.shields.io/badge/Eligibility%20Accuracy-100%25%20%28Curated%20Dataset%29-blue)](#running-evaluation-suite)

---

## 📌 Project Overview

This project provides a transparent, deterministic recommendation system designed to match Indian citizens with eligible government welfare schemes (scholarships, agricultural subsidies, health insurance, housing, etc.).

### Key Architectural Principle: Decoupled AI & Uncertainty Modeling

The decision engine produces three distinct eligibility outcomes:
1. **`ELIGIBLE`**: All required scheme rules are satisfied by the user profile (`match_score = 1.00`).
2. **`INSUFFICIENT INFORMATION`**: Missing user profile attributes prevent a deterministic decision. The system explicitly reports missing fields and sets `match_score = null`.
3. **`NOT ELIGIBLE`**: One or more scheme rules are explicitly violated by the user profile.

> **Key Architectural Guarantee**: The architecture prevents LLM-generated information from directly determining eligibility; final eligibility decisions remain deterministic and explainable. Large Language Models (LLMs) are used strictly for natural-language profile parsing with mandatory citizen review.

---

## 🛠 Technology Stack

- **Backend**: Python 3.10+ / FastAPI / Pydantic v2 / PyMongo / Pytest / HTTPX
- **Frontend**: React 18 / Vite 5 / Tailwind CSS v4 / Lucide React / Axios
- **Database**: MongoDB Atlas (Cloud Database)
- **AI Integration**: Google Gemini API (`GeminiLLMProvider`) with fallback to offline regex adapter (`MockLLMProvider`)

---

## 📂 Project Structure

```
govt-scheme-rec/
├── .env.example                     # Environment variables template
├── README.md                        # Master project README
│
├── backend/                         # FastAPI Backend
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & CORS
│   │   ├── config.py                # Environment configuration
│   │   ├── database.py              # MongoDB Atlas connection manager
│   │   ├── models/                  # Pydantic models (User, Scheme, Profile)
│   │   ├── routers/                 # API Endpoints (auth, schemes, eligibility, ai)
│   │   └── ai/                      # LLM Provider abstraction & providers
│   ├── tests/                       # Pytest test suite (40 tests)
│   └── requirements.txt             # Python dependencies
│
├── frontend/                        # React Single Page Application
│   ├── src/
│   │   ├── components/              # UI Components & Modals
│   │   ├── context/                 # AuthContext
│   │   ├── pages/                   # Pages (Landing, Explorer, Recommendations, Admin)
│   │   └── api/                     # Axios instance & interceptors
│   ├── package.json                 # Node dependencies
│   └── vite.config.js               # Vite build configuration
│
├── scripts/                         # Database Seeding & Evaluation
│   ├── seed_schemes.py              # Scheme seeding script
│   └── evaluation/                  # Phase 10 ground-truth evaluation suite
│       ├── dataset.json             # 20 ground-truth test cases
│       ├── run_all_evaluations.py   # Benchmark execution script
│       └── results.json             # Output evaluation metrics
│
└── docs/                            # Comprehensive System Documentation
    ├── README.md                    # Documentation index
    ├── RESEARCH_REPORT.md           # Academic research paper / report
    ├── ARCHITECTURE_DIAGRAM.md      # Mermaid architecture & sequence diagrams
    ├── EVALUATION.md                # Phase 10 empirical evaluation report
    ├── VIVA_NOTES.md                # Viva voce / oral defense Q&A guide
    └── FINAL_PROJECT_STATUS.md      # Final project status & submission report
```

---

## 🚀 Setup & Execution Guide

### 1. Environment Configuration

```bash
# Copy template configuration
cp .env.example .env

# Edit .env and supply your MONGODB_URI and optional GEMINI_API_KEY
```

### 2. Backend Setup & Run

```bash
# Create Python virtual environment
python3 -m venv backend/venv

# Activate environment
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Seed scheme data into MongoDB
PYTHONPATH=.:backend backend/venv/bin/python scripts/seed_schemes.py

# Run FastAPI development server
PYTHONPATH=.:backend backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup & Run

```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests & Evaluation

### Backend Pytest Suite (40 Tests)

```bash
ENVIRONMENT=testing PYTHONPATH=.:backend backend/venv/bin/pytest backend/tests
```

### Complete System Evaluation Suite

```bash
ENVIRONMENT=testing PYTHONPATH=.:backend backend/venv/bin/python scripts/evaluation/run_all_evaluations.py
```

### Frontend Production Build Verification

```bash
cd frontend && npm run build
```

---

## 📊 Evaluation Summary (Phase 10 Benchmark)

- **Eligibility Engine Accuracy**: `100.00%` (20/20 test cases on curated dataset)
- **Macro Precision / Recall / F1**: `1.0000` / `1.0000` / `1.0000`
- **Recommendation Tier Order Preservation**: `100.00%`
- **Archived Scheme Exclusion Rate**: `100.00%`
- **AI Missing Field Detection Rate**: `100.00%`
- *Disclaimers*: 100% accuracy applies strictly to the 20-case curated benchmark dataset. AI extraction metrics report offline mock provider baseline performance.

---

## 📚 Technical Documentation & Defense Guide

For detailed research papers, visual architecture diagrams, evaluation metrics, and oral defense Q&A:
- 📄 [Research Report](file:///home/saru/Documents/govt%20scheme%20rec/docs/RESEARCH_REPORT.md)
- 📐 [Architecture Diagrams](file:///home/saru/Documents/govt%20scheme%20rec/docs/ARCHITECTURE_DIAGRAM.md)
- 📊 [Evaluation Report](file:///home/saru/Documents/govt%20scheme%20rec/docs/EVALUATION.md)
- 🎓 [Viva Voce Q&A Notes](file:///home/saru/Documents/govt%20scheme%20rec/docs/VIVA_NOTES.md)
- 📋 [Final Project Status Report](file:///home/saru/Documents/govt%20scheme%20rec/docs/FINAL_PROJECT_STATUS.md)
# YojnaSetu
