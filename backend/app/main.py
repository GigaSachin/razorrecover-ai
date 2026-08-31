from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.schemas import (
    AuditEvent,
    BatchRecoveryRequest,
    BatchRecoveryResponse,
    DashboardMetrics,
    DiagnoseRequest,
    DiagnoseResponse,
    ExecuteRecoveryRequest,
    ExecuteRecoveryResponse,
    FailureReasonBreakdown,
    GuardrailSettings,
    HinglishChatRequest,
    HinglishChatResponse,
    LoginRequest,
    LoginResponse,
    RecoveryCase,
    RecoveryFunnelStep,
    RecoveryTrendPoint,
)
from backend.app.services.ai_agent import ai_agent
from backend.app.services.batch_engine import batch_engine
from backend.app.services.data_service import (
    create_audit_event,
    create_case,
    delete_case,
    get_case_by_id,
    get_dashboard_metrics,
    get_failure_reasons,
    get_guardrail_settings,
    get_recovery_funnel,
    get_recovery_trend,
    init_db,
    load_audit_events,
    load_cases,
    save_guardrail_settings,
    update_case,
)
from backend.app.services.guardrails import guardrail_engine

app = FastAPI(
    title="RazorRecover AI",
    description="Autonomous AI Revenue Recovery & Smart Dunning Engine for Razorpay",
    version="2.0.0",
)

ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = ROOT / "frontend" / "dist"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "RazorRecover AI",
        "edition": "Enterprise Edition",
        "version": "2.0.0",
    }


USER_ACCOUNTS = {
    "admin": {
        "password": "admin123",
        "role": "admin",
        "name": "Razorpay Operations Lead",
        "email": "admin@razorpay.com",
    },
    "analyst": {
        "password": "analyst123",
        "role": "analyst",
        "name": "Recovery Specialist",
        "email": "analyst@razorpay.com",
    },
}


@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    user = USER_ACCOUNTS.get(payload.username.lower())
    if not user or user["password"] != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. (Hint: Try admin / admin123 or analyst / analyst123)",
        )

    token = f"jwt_mock_token_{user['role']}_{uuid.uuid4().hex[:12]}"
    expires_at = datetime.now(timezone.utc).isoformat()

    return LoginResponse(
        token=token,
        username=payload.username.lower(),
        role=user["role"],
        name=user["name"],
        email=user["email"],
        expires_at=expires_at,
    )



# ============================================================================
# Dashboard & Analytics Endpoints
# ============================================================================

@app.get("/api/metrics", response_model=DashboardMetrics)
def get_metrics() -> DashboardMetrics:
    return get_dashboard_metrics()


@app.get("/api/metrics/trend", response_model=List[RecoveryTrendPoint])
def get_trend() -> List[RecoveryTrendPoint]:
    return get_recovery_trend()


@app.get("/api/metrics/failures", response_model=List[FailureReasonBreakdown])
def get_failures() -> List[FailureReasonBreakdown]:
    return get_failure_reasons()


@app.get("/api/metrics/funnel", response_model=List[RecoveryFunnelStep])
def get_funnel() -> List[RecoveryFunnelStep]:
    return get_recovery_funnel()


# ============================================================================
# Case Management & Diagnostics Endpoints
# ============================================================================

@app.get("/api/cases", response_model=List[RecoveryCase])
def list_cases(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
) -> List[RecoveryCase]:
    cases = load_cases(
        status=status,
        risk_level=risk_level,
        payment_method=payment_method,
        search=search,
    )
    return [RecoveryCase(**c) for c in cases]


@app.get("/api/cases/{case_id}", response_model=RecoveryCase)
def get_case(case_id: str) -> RecoveryCase:
    case_data = get_case_by_id(case_id)
    if not case_data:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return RecoveryCase(**case_data)


@app.post("/api/cases", response_model=RecoveryCase, status_code=status.HTTP_201_CREATED)
def add_case(payload: RecoveryCase) -> RecoveryCase:
    created = create_case(payload.model_dump(mode="json"))
    return RecoveryCase(**created)


@app.post("/api/cases/{case_id}/diagnose", response_model=DiagnoseResponse)
def diagnose_case(case_id: str) -> DiagnoseResponse:
    case_data = get_case_by_id(case_id)
    if not case_data:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    
    case = RecoveryCase(**case_data)
    diagnosis = ai_agent.diagnose_case(case)

    # Update case with AI findings
    case.ai_diagnosis = diagnosis.root_cause
    case.ai_confidence = diagnosis.confidence_score
    case.recommended_action = diagnosis.recommended_strategy
    case.recommended_channel = diagnosis.recommended_channel
    case.policy_status = "blocked" if diagnosis.guardrail_decision == "BLOCK" else "flagged" if diagnosis.guardrail_decision == "FLAG_FOR_REVIEW" else "passed"
    case.guardrail_notes = diagnosis.stopping_rule_triggered
    case.status = "diagnosed" if case.status == "new" else case.status
    
    update_case(case.model_dump(mode="json"))
    return diagnosis


@app.post("/api/cases/{case_id}/execute", response_model=ExecuteRecoveryResponse)
def execute_case_recovery(case_id: str, payload: Optional[ExecuteRecoveryRequest] = None) -> ExecuteRecoveryResponse:
    case_data = get_case_by_id(case_id)
    if not case_data:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    
    case = RecoveryCase(**case_data)
    diagnosis = ai_agent.diagnose_case(case)
    now_str = datetime.now(timezone.utc).isoformat()
    audit_id = f"audit_{uuid.uuid4().hex[:10]}"

    channel = payload.channel_override if payload and payload.channel_override else diagnosis.recommended_channel

    # Check guardrails unless forced
    if diagnosis.guardrail_decision == "BLOCK" and not (payload and payload.force_execution):
        raise HTTPException(
            status_code=400,
            detail=f"Execution blocked by stopping rule: {diagnosis.stopping_rule_triggered}",
        )

    if diagnosis.guardrail_decision == "FLAG_FOR_REVIEW" and not (payload and payload.force_execution):
        case.status = "escalated_to_human"
        case.escalated_to_human = True
        update_case(case.model_dump(mode="json"))
        return ExecuteRecoveryResponse(
            case_id=case.id,
            success=False,
            status="escalated_to_human",
            execution_status="pending",
            action_taken="Escalated to human recovery analyst",
            channel_used="human_analyst",
            recovered_amount=0.0,
            audit_event_id=audit_id,
            details=f"Escalation required: {diagnosis.stopping_rule_triggered}",
        )

    # Execute recovery action
    is_immediate = "upi" in channel or "whatsapp" in channel or "card" in case.payment_method
    recovered_amount = case.amount if is_immediate else 0.0
    new_status = "recovered" if is_immediate else "in_progress"
    exec_status = "completed" if is_immediate else "scheduled"

    case.status = new_status
    case.execution_status = exec_status
    case.revenue_recovered = recovered_amount
    case.updated_at = now_str

    attempt = {
        "id": f"att_{uuid.uuid4().hex[:8]}",
        "case_id": case.id,
        "attempt_number": len(case.attempts) + 1,
        "action": diagnosis.recommended_strategy,
        "channel": channel,
        "result": "success" if is_immediate else "scheduled",
        "timestamp": now_str,
        "details": f"Executed via {channel}",
        "recovered_amount": recovered_amount,
    }
    case.attempts.append(attempt)  # type: ignore

    update_case(case.model_dump(mode="json"))

    # Log audit event
    create_audit_event(
        AuditEvent(
            id=audit_id,
            timestamp=now_str,
            case_id=case.id,
            event_type="REVENUE_RECOVERED" if is_immediate else "RECOVERY_SCHEDULED",
            actor="ai_agent",
            ai_decision=diagnosis.recommended_strategy,
            execution_result="SUCCESS" if is_immediate else "SCHEDULED",
            revenue_impact=recovered_amount,
            description=f"Action '{diagnosis.recommended_strategy}' executed via {channel}.",
        )
    )

    return ExecuteRecoveryResponse(
        case_id=case.id,
        success=True,
        status=new_status,
        execution_status=exec_status,
        action_taken=diagnosis.recommended_strategy,
        channel_used=channel,
        recovered_amount=recovered_amount,
        message_sent=diagnosis.hinglish_message or diagnosis.personalized_outreach_message,
        audit_event_id=audit_id,
        details=f"Successfully executed via {channel}. Recovered ₹{recovered_amount:,.2f}",
    )


# ============================================================================
# Batch Recovery & Simulation Engine ("The Bar")
# ============================================================================

@app.post("/api/batch/run", response_model=BatchRecoveryResponse)
def run_batch_recovery(payload: BatchRecoveryRequest) -> BatchRecoveryResponse:
    return batch_engine.run_batch(payload)


# ============================================================================
# Interactive Hinglish Conversational Agent
# ============================================================================

@app.post("/api/chat/recover", response_model=HinglishChatResponse)
def chat_recover(payload: HinglishChatRequest) -> HinglishChatResponse:
    res = ai_agent.handle_hinglish_chat(payload)
    
    # If a Promise-to-Pay was detected and a case_id was provided, update the case
    if res.promise_to_pay_detected and res.promised_date and payload.case_id:
        case_data = get_case_by_id(payload.case_id)
        if case_data:
            case_data["promise_to_pay_date"] = res.promised_date
            case_data["status"] = "in_progress"
            update_case(case_data)
            create_audit_event(
                AuditEvent(
                    id=f"audit_{uuid.uuid4().hex[:10]}",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    case_id=payload.case_id,
                    event_type="PROMISE_TO_PAY_RECORDED",
                    actor="ai_agent",
                    ai_decision=f"Promise to Pay recorded for {res.promised_date}",
                    execution_result="SUCCESS",
                    revenue_impact=0.0,
                    description=f"Customer promised to pay by {res.promised_date}. Automated dunning paused until then.",
                )
            )

    return res


# ============================================================================
# Guardrails & Audit Logs
# ============================================================================

@app.get("/api/guardrails", response_model=GuardrailSettings)
def get_guardrails() -> GuardrailSettings:
    return get_guardrail_settings()


@app.post("/api/guardrails", response_model=GuardrailSettings)
def update_guardrails(payload: GuardrailSettings) -> GuardrailSettings:
    saved = save_guardrail_settings(payload)
    guardrail_engine.settings = saved
    return saved


@app.get("/api/audit", response_model=List[AuditEvent])
def get_audit_trail(limit: int = Query(default=50, ge=1, le=500)) -> List[AuditEvent]:
    events = load_audit_events(limit=limit)
    return [AuditEvent(**e) for e in events]


@app.post("/api/reset-data")
def reset_demo_data() -> dict[str, str]:
    from backend.app.services.data_service import seed_cases_from_json, _connect_db
    conn = _connect_db()
    conn.execute("DELETE FROM cases")
    conn.execute("DELETE FROM audit_logs")
    seed_cases_from_json(conn)
    conn.close()
    return {"message": "Demo data reset successfully with 50 fresh cases"}


# Serve production frontend if built
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
