from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.app.schemas import (
    AuditEvent,
    DashboardMetrics,
    FailureReasonBreakdown,
    GuardrailSettings,
    RecoveryCase,
    RecoveryFunnelStep,
    RecoveryTrendPoint,
)

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / "data" / "cases.json"
DB_PATH = ROOT / "data" / "cases.db"
DATABASE_URL = os.getenv("DATABASE_URL")


def _connect_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    """Initializes tables for cases, audit_logs, and guardrail_settings."""
    conn = _connect_db()
    cursor = conn.cursor()

    # Check if existing cases table has new schema
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cases'")
    table_exists = cursor.fetchone()
    if table_exists:
        cursor.execute("PRAGMA table_info(cases)")
        columns = [row[1] for row in cursor.fetchall()]
        if "created_at" not in columns or "payment_id" not in columns:
            cursor.execute("DROP TABLE cases")
            conn.commit()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            payment_id TEXT,
            customer_id TEXT,
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            amount REAL,
            currency TEXT,
            payment_method TEXT,
            failure_reason TEXT,
            error_code TEXT,
            risk_level TEXT,
            recovery_probability INTEGER,
            status TEXT,
            created_at TEXT,
            updated_at TEXT,
            ai_diagnosis TEXT,
            ai_confidence INTEGER,
            recommended_action TEXT,
            recommended_channel TEXT,
            policy_status TEXT,
            guardrail_notes TEXT,
            execution_status TEXT,
            escalated_to_human INTEGER,
            attempts TEXT,
            revenue_recovered REAL,
            promise_to_pay_date TEXT,
            scheduled_retry_time TEXT,
            metadata TEXT
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT,
            case_id TEXT,
            event_type TEXT,
            actor TEXT,
            ai_decision TEXT,
            policy_decision TEXT,
            execution_result TEXT,
            revenue_impact REAL,
            description TEXT,
            metadata TEXT
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS guardrail_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            settings_json TEXT
        )
        """
    )

    conn.commit()

    # Check if cases table has data, else seed
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_cases_from_json(conn)

    conn.close()


def seed_cases_from_json(conn) -> None:
    if not DATA_PATH.exists():
        dataset_generator = ROOT / "data" / "generate_dataset.py"
        if dataset_generator.exists():
            import subprocess
            subprocess.run(["python", str(dataset_generator)], check=True)

    if DATA_PATH.exists():
        payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        cases = payload.get("cases", [])
        for c in cases:
            conn.execute(
                """
                INSERT OR REPLACE INTO cases (
                    id, payment_id, customer_id, customer_name, customer_phone, customer_email,
                    amount, currency, payment_method, failure_reason, error_code, risk_level,
                    recovery_probability, status, created_at, updated_at, ai_diagnosis,
                    ai_confidence, recommended_action, recommended_channel, policy_status,
                    guardrail_notes, execution_status, escalated_to_human, attempts,
                    revenue_recovered, promise_to_pay_date, scheduled_retry_time, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    c.get("id"),
                    c.get("payment_id"),
                    c.get("customer_id"),
                    c.get("customer_name"),
                    c.get("customer_phone"),
                    c.get("customer_email"),
                    c.get("amount", 0.0),
                    c.get("currency", "INR"),
                    c.get("payment_method"),
                    c.get("failure_reason"),
                    c.get("error_code", "GATEWAY_TIMEOUT"),
                    c.get("risk_level", "medium"),
                    c.get("recovery_probability", 75),
                    c.get("status", "new"),
                    c.get("created_at"),
                    c.get("updated_at"),
                    c.get("ai_diagnosis"),
                    c.get("ai_confidence"),
                    c.get("recommended_action"),
                    c.get("recommended_channel"),
                    c.get("policy_status", "passed"),
                    c.get("guardrail_notes"),
                    c.get("execution_status", "pending"),
                    1 if c.get("escalated_to_human") else 0,
                    json.dumps(c.get("attempts", [])),
                    c.get("revenue_recovered", 0.0),
                    c.get("promise_to_pay_date"),
                    c.get("scheduled_retry_time"),
                    json.dumps(c.get("metadata", {})),
                ),
            )
        conn.commit()


# Initialize database on module load
init_db()


def _row_to_case(row: sqlite3.Row) -> Dict[str, Any]:
    d = dict(row)
    d["escalated_to_human"] = bool(d.get("escalated_to_human"))
    try:
        d["attempts"] = json.loads(d.get("attempts") or "[]")
    except Exception:
        d["attempts"] = []
    try:
        d["metadata"] = json.loads(d.get("metadata") or "{}")
    except Exception:
        d["metadata"] = {}
    return d


def load_cases(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    conn = _connect_db()
    query = "SELECT * FROM cases WHERE 1=1"
    params: List[Any] = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if risk_level:
        query += " AND risk_level = ?"
        params.append(risk_level)
    if payment_method:
        query += " AND payment_method = ?"
        params.append(payment_method)
    if search:
        query += " AND (customer_name LIKE ? OR payment_id LIKE ? OR failure_reason LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [_row_to_case(r) for r in rows]


def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    conn = _connect_db()
    row = conn.execute("SELECT * FROM cases WHERE id = ? OR payment_id = ?", (case_id, case_id)).fetchone()
    conn.close()
    return _row_to_case(row) if row else None


def update_case(case_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = _connect_db()
    conn.execute(
        """
        UPDATE cases SET
            customer_name = ?,
            amount = ?,
            payment_method = ?,
            failure_reason = ?,
            error_code = ?,
            risk_level = ?,
            recovery_probability = ?,
            status = ?,
            updated_at = ?,
            ai_diagnosis = ?,
            ai_confidence = ?,
            recommended_action = ?,
            recommended_channel = ?,
            policy_status = ?,
            guardrail_notes = ?,
            execution_status = ?,
            escalated_to_human = ?,
            attempts = ?,
            revenue_recovered = ?,
            promise_to_pay_date = ?,
            scheduled_retry_time = ?,
            metadata = ?
        WHERE id = ?
        """,
        (
            case_data.get("customer_name"),
            case_data.get("amount"),
            case_data.get("payment_method"),
            case_data.get("failure_reason"),
            case_data.get("error_code"),
            case_data.get("risk_level"),
            case_data.get("recovery_probability"),
            case_data.get("status"),
            case_data.get("updated_at") or datetime.now(timezone.utc).isoformat(),
            case_data.get("ai_diagnosis"),
            case_data.get("ai_confidence"),
            case_data.get("recommended_action"),
            case_data.get("recommended_channel"),
            case_data.get("policy_status"),
            case_data.get("guardrail_notes"),
            case_data.get("execution_status"),
            1 if case_data.get("escalated_to_human") else 0,
            json.dumps(case_data.get("attempts", [])),
            case_data.get("revenue_recovered", 0.0),
            case_data.get("promise_to_pay_date"),
            case_data.get("scheduled_retry_time"),
            json.dumps(case_data.get("metadata", {})),
            case_data.get("id"),
        ),
    )
    conn.commit()
    conn.close()
    return get_case_by_id(case_data.get("id")) or case_data


def create_case(case_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = _connect_db()
    case_id = case_data.get("id") or f"case_{uuid.uuid4().hex[:6]}"
    now_str = datetime.now(timezone.utc).isoformat()

    conn.execute(
        """
        INSERT INTO cases (
            id, payment_id, customer_id, customer_name, customer_phone, customer_email,
            amount, currency, payment_method, failure_reason, error_code, risk_level,
            recovery_probability, status, created_at, updated_at, ai_diagnosis,
            ai_confidence, recommended_action, recommended_channel, policy_status,
            guardrail_notes, execution_status, escalated_to_human, attempts,
            revenue_recovered, promise_to_pay_date, scheduled_retry_time, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            case_id,
            case_data.get("payment_id") or f"pay_rzp_{uuid.uuid4().hex[:8]}",
            case_data.get("customer_id") or f"cust_{uuid.uuid4().hex[:6]}",
            case_data.get("customer_name") or "New Customer",
            case_data.get("customer_phone", "+91 98765 43210"),
            case_data.get("customer_email", "customer@example.com"),
            case_data.get("amount", 1000.0),
            case_data.get("currency", "INR"),
            case_data.get("payment_method", "upi"),
            case_data.get("failure_reason", "Payment failed"),
            case_data.get("error_code", "GATEWAY_TIMEOUT"),
            case_data.get("risk_level", "medium"),
            case_data.get("recovery_probability", 75),
            case_data.get("status", "new"),
            case_data.get("created_at") or now_str,
            case_data.get("updated_at") or now_str,
            case_data.get("ai_diagnosis"),
            case_data.get("ai_confidence", 85),
            case_data.get("recommended_action"),
            case_data.get("recommended_channel"),
            case_data.get("policy_status", "passed"),
            case_data.get("guardrail_notes"),
            case_data.get("execution_status", "pending"),
            1 if case_data.get("escalated_to_human") else 0,
            json.dumps(case_data.get("attempts", [])),
            case_data.get("revenue_recovered", 0.0),
            case_data.get("promise_to_pay_date"),
            case_data.get("scheduled_retry_time"),
            json.dumps(case_data.get("metadata", {})),
        ),
    )
    conn.commit()
    conn.close()
    return get_case_by_id(case_id) or case_data


def delete_case(case_id: str) -> bool:
    conn = _connect_db()
    cursor = conn.execute("DELETE FROM cases WHERE id = ?", (case_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def create_audit_event(event: AuditEvent) -> AuditEvent:
    conn = _connect_db()
    conn.execute(
        """
        INSERT INTO audit_logs (
            id, timestamp, case_id, event_type, actor, ai_decision,
            policy_decision, execution_result, revenue_impact, description, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event.id,
            event.timestamp,
            event.case_id,
            event.event_type,
            event.actor,
            event.ai_decision,
            event.policy_decision,
            event.execution_result,
            event.revenue_impact,
            event.description,
            json.dumps(event.metadata),
        ),
    )
    conn.commit()
    conn.close()
    return event


def load_audit_events(limit: int = 50) -> List[Dict[str, Any]]:
    conn = _connect_db()
    rows = conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    events = []
    for r in rows:
        d = dict(r)
        try:
            d["metadata"] = json.loads(d.get("metadata") or "{}")
        except Exception:
            d["metadata"] = {}
        events.append(d)
    return events


def get_guardrail_settings() -> GuardrailSettings:
    conn = _connect_db()
    row = conn.execute("SELECT settings_json FROM guardrail_settings WHERE id = 1").fetchone()
    conn.close()
    if row and row["settings_json"]:
        return GuardrailSettings(**json.loads(row["settings_json"]))
    return GuardrailSettings()


def save_guardrail_settings(settings: GuardrailSettings) -> GuardrailSettings:
    conn = _connect_db()
    conn.execute(
        "INSERT OR REPLACE INTO guardrail_settings (id, settings_json) VALUES (1, ?)",
        (json.dumps(settings.model_dump(mode="json")),),
    )
    conn.commit()
    conn.close()
    return settings


def get_dashboard_metrics() -> DashboardMetrics:
    cases = load_cases()
    total_at_risk = sum(c["amount"] for c in cases)
    total_recovered = sum(c["revenue_recovered"] for c in cases)
    recovered_count = sum(1 for c in cases if c["status"] == "recovered")
    active_cases = sum(1 for c in cases if c["status"] not in {"recovered", "abandoned", "failed"})
    escalations = sum(1 for c in cases if c["escalated_to_human"])
    blocks = sum(1 for c in cases if c.get("policy_status") == "blocked")

    avg_prob = (
        sum(c["recovery_probability"] for c in cases) / len(cases)
        if cases
        else 0.0
    )

    channel_rev: Dict[str, float] = {"upi_link": 0.0, "smart_retry": 0.0, "whatsapp_hinglish": 0.0, "email": 0.0}
    for c in cases:
        if c["status"] == "recovered" and c["revenue_recovered"] > 0:
            ch = c.get("recommended_channel") or "upi_link"
            channel_rev[ch] = channel_rev.get(ch, 0.0) + c["revenue_recovered"]

    rate = round((total_recovered / total_at_risk * 100), 2) if total_at_risk > 0 else 0.0

    return DashboardMetrics(
        total_revenue_at_risk=round(total_at_risk, 2),
        total_revenue_recovered=round(total_recovered, 2),
        recovery_rate=rate,
        active_cases=active_cases,
        average_recovery_probability=round(avg_prob, 1),
        cases_this_month=len(cases),
        human_escalations_count=escalations,
        guardrail_blocks_count=blocks,
        revenue_recovered_by_channel=channel_rev,
    )


def get_recovery_trend() -> List[RecoveryTrendPoint]:
    cases = load_cases()
    # Group by date
    daily_data: Dict[str, Dict[str, float]] = {}
    for c in cases:
        date_key = c["created_at"][:10] if c.get("created_at") else "2026-08-30"
        if date_key not in daily_data:
            daily_data[date_key] = {"at_risk": 0.0, "recovered": 0.0}
        daily_data[date_key]["at_risk"] += c["amount"]
        daily_data[date_key]["recovered"] += c.get("revenue_recovered", 0.0)

    points = []
    for d in sorted(daily_data.keys()):
        points.append(
            RecoveryTrendPoint(
                date=d,
                recovered=round(daily_data[d]["recovered"], 2),
                at_risk=round(daily_data[d]["at_risk"], 2),
            )
        )
    return points


def get_failure_reasons() -> List[FailureReasonBreakdown]:
    cases = load_cases()
    reasons: Dict[str, Dict[str, Any]] = {}
    for c in cases:
        r = c.get("failure_reason") or "Unknown"
        if r not in reasons:
            reasons[r] = {"count": 0, "amount": 0.0}
        reasons[r]["count"] += 1
        reasons[r]["amount"] += c["amount"]

    total = len(cases) if cases else 1
    return [
        FailureReasonBreakdown(
            reason=k,
            count=v["count"],
            percentage=round((v["count"] / total) * 100, 1),
            total_amount=round(v["amount"], 2),
        )
        for k, v in reasons.items()
    ]


def get_recovery_funnel() -> List[RecoveryFunnelStep]:
    cases = load_cases()
    total = len(cases) if cases else 1
    diagnosed = sum(1 for c in cases if c["status"] in {"diagnosed", "recommended", "in_progress", "recovered"})
    recommended = sum(1 for c in cases if c["status"] in {"recommended", "in_progress", "recovered"})
    in_progress = sum(1 for c in cases if c["status"] in {"in_progress", "recovered"})
    recovered = sum(1 for c in cases if c["status"] == "recovered")

    return [
        RecoveryFunnelStep(step="Failed Payments Detected", count=total, percentage=100.0),
        RecoveryFunnelStep(step="AI Diagnosed & Triaged", count=diagnosed, percentage=round(diagnosed / total * 100, 1)),
        RecoveryFunnelStep(step="Guardrail Approved & Strategy Built", count=recommended, percentage=round(recommended / total * 100, 1)),
        RecoveryFunnelStep(step="Intervention Dispatched", count=in_progress, percentage=round(in_progress / total * 100, 1)),
        RecoveryFunnelStep(step="Revenue Recovered", count=recovered, percentage=round(recovered / total * 100, 1)),
    ]
