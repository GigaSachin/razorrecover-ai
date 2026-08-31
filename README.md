# RazorRecover AI

> **Autonomous AI Revenue Recovery & Smart Dunning Engine for Razorpay**  
> *Built for Razorpay /buildathon — Track 03: AI Revenue Recovery*

---

## 🏆 Project Overview

**RazorRecover AI** is a production-grade, full-stack autonomous revenue recovery agent engineered specifically for the Indian fintech and digital commerce ecosystem.

Revenue loss rarely happens in one clean step:
- A UPI transaction degrades during bank PSP network spikes.
- A recurring e-Mandate auto-debit fails due to salary-cycle timing.
- A customer drops off during 3DS OTP card verification.
- A high-value B2B invoice gets delayed in enterprise accounts payable.

RazorRecover AI closes the loop from **detection to root-cause diagnosis, strategy formulation, compliant multi-channel outreach (including Hinglish conversational voice/chat), and measured money recovered across batches**.

---

## 🌟 Key Features

### 1. 🤖 Autonomous Multi-Channel Recovery Agent
- **Root-Cause Triage**: Diagnoses bank gateway timeouts (`BAD_REQUEST_PAYMENT_TIMEDOUT`), insufficient funds, expired cards, and mandate declines.
- **Smart Mandate Retry Sequencer**: Schedules auto-debits aligned with salary credit cycles (1st–5th of month) and bank clearing windows (08:30 AM IST).
- **Hinglish Conversational Voice/Chat**: Engages customers in natural, empathetic Hinglish (e.g. WhatsApp, SMS, IVR), offering dynamic recovery discounts and extracting structured **Promise-to-Pay (PTP)** commitments.
- **B2B Receivables Chaser**: Multi-stage invoice escalation with automated virtual account generation.

### 2. 🛡️ Strict Guardrails & Compliant Stopping Rules ("The Bar")
- **RBI Dunning Compliance**: Automated contact window restrictions (8:00 AM – 7:00 PM IST).
- **Max Outreach Cap**: Strict 3-contact stopping rule to prevent customer spamming.
- **High-Value Human Escalation**: Transactions > ₹50,000 automatically route to human recovery specialists.
- **Circuit Breakers**: Immediate automatic stopping on fatal non-retryable errors (`USER_REVOKED_MANDATE`, `INVALID_VPA_PERMANENT`, `ACCOUNT_CLOSED`).

### 3. 📊 Measured Batch Recovery Simulator
- Run batch recoveries across 50+ diverse transaction scenarios.
- Real-time animated ticker calculating exact rupees won back, recovery rate percentage, and ROI metrics.

### 4. 📜 Immutable Audit Trail
- Complete chronological audit log of all AI decisions, guardrail safety blocks, human escalations, and financial impacts.

---

## 🏗️ Architecture & Stack

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   RazorRecover AI System Architecture                  │
 └────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  React 19 + Vite Frontend    │              │   FastAPI Python Backend     │
│  - Executive Dashboard       │ ◄──────────► │  - Autonomous Recovery Agent │
│  - Batch Recovery Runner     │              │  - Gemini & LLM Orchestrator │
│  - Hinglish Chat Simulator   │              │  - Deterministic Guardrails  │
│  - AI Case Inspector         │              │  - Smart Retry Optimizer     │
│  - Compliance Console        │              │  - SQLite / PostgreSQL       │
│  - Immutable Audit Log       │              │  - Batch Analytics Engine    │
└──────────────────────────────┘              └──────────────────────────────┘
```

- **Backend**: Python 3.12+, FastAPI, Pydantic v2, Pytest, SQLite / PostgreSQL
- **Frontend**: React 19, Vite, TailwindCSS, Recharts, Lucide Icons, Date-fns
- **AI & NLP**: Dual engine supporting Google Gemini / OpenAI with offline intelligent fallback

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
# Activate virtual environment
source .venv/bin/activate   # Linux/macOS
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run backend test suite
pytest

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build   # Production bundle validation
npm run dev     # Start Vite dev server on http://localhost:5173
```

### 3. Open in Browser
Visit **http://localhost:5173** (or http://localhost:8000 when serving production build).

---

## 🧪 Testing & Validation

Run comprehensive backend automated tests verifying all compliance guardrails, stopping rules, AI diagnosis, and batch calculations:

```bash
pytest -v
```

Output:
```
tests/test_ai_agent.py::test_diagnose_upi_timeout PASSED
tests/test_ai_agent.py::test_diagnose_insufficient_funds_mandate PASSED
tests/test_ai_agent.py::test_hinglish_negotiator_discount_intent PASSED
tests/test_api.py::test_health_check PASSED
tests/test_api.py::test_get_metrics PASSED
tests/test_api.py::test_list_cases PASSED
tests/test_api.py::test_diagnose_case PASSED
tests/test_api.py::test_batch_recovery_run PASSED
tests/test_api.py::test_hinglish_chat_with_ptp PASSED
tests/test_api.py::test_guardrails_api PASSED
tests/test_guardrails.py::test_guardrail_allows_normal_case PASSED
tests/test_guardrails.py::test_guardrail_blocks_non_retryable_fatal_error PASSED
tests/test_guardrails.py::test_guardrail_blocks_max_attempts_exceeded PASSED
tests/test_guardrails.py::test_guardrail_flags_high_value_for_human_review PASSED
tests/test_guardrails.py::test_guardrail_blocks_when_active_promise_to_pay PASSED
======================= 15 passed in 1.1s =======================
```

---

## 📁 Repository Structure

```
razorrecover-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI REST routes & app lifecycle
│   │   ├── schemas.py                  # Pydantic v2 domain & API models
│   │   └── services/
│   │       ├── ai_agent.py             # Root-cause triage & Hinglish NLP agent
│   │       ├── guardrails.py           # Deterministic stopping rules & RBI checks
│   │       ├── batch_engine.py         # Batch execution & measured money recovery
│   │       └── data_service.py         # SQLite persistence & analytics
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/common/          # Cards, Layout, MetricCard, Logo
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Executive Command Center
│   │   │   ├── BatchRecovery.tsx       # "The Bar" Showcase (Batch Runner)
│   │   │   ├── RecoveryCenter.tsx      # AI Case Inspector & 1-Click Dispatch
│   │   │   ├── HinglishRecoveryChat.tsx # WhatsApp/Voice Simulator & PTP Tracker
│   │   │   ├── Cases.tsx               # Filterable Failed Payments Database
│   │   │   ├── CaseDetail.tsx          # Case Deep Dive & Timeline
│   │   │   ├── AuditTrail.tsx          # Immutable Compliance Log
│   │   │   └── Settings.tsx            # Guardrails Configuration Console
│   │   ├── services/api.ts             # Type-safe API client
│   │   └── types/index.ts              # TypeScript domain types
│   └── package.json
├── data/
│   ├── generate_dataset.py             # Realistic Indian payments seed generator
│   └── cases.json                      # 50+ curated failure records
├── docs/
│   ├── SUBMISSION.md                   # Form answers & 5-minute pitch video script
│   └── project_plan.md
├── tests/
│   ├── test_ai_agent.py
│   ├── test_api.py
│   └── test_guardrails.py
└── README.md
```

---

