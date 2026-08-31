from __future__ import annotations

from datetime import datetime, timedelta, timezone
from backend.app.schemas import RecoveryAttempt, RecoveryCase
from backend.app.services.guardrails import GuardrailEngine, DEFAULT_GUARDRAILS


def make_test_case(
    amount: float = 2500.0,
    error_code: str = "GATEWAY_TIMEOUT",
    attempts_count: int = 0,
    promise_date: str | None = None,
) -> RecoveryCase:
    now = datetime.now(timezone.utc)
    attempts = [
        RecoveryAttempt(
            id=f"att_{i}",
            case_id="case_test",
            attempt_number=i + 1,
            action="Nudge",
            channel="upi_link",
            result="failed",
            timestamp=(now - timedelta(hours=6)).isoformat(),
        )
        for i in range(attempts_count)
    ]

    return RecoveryCase(
        id="case_test_01",
        payment_id="pay_test_01",
        customer_id="cust_test_01",
        customer_name="Test User",
        amount=amount,
        payment_method="upi",
        failure_reason="Network timeout",
        error_code=error_code,
        risk_level="medium",
        recovery_probability=85,
        status="new",
        created_at=now.isoformat(),
        updated_at=now.isoformat(),
        attempts=attempts,
        promise_to_pay_date=promise_date,
    )


def test_guardrail_allows_normal_case():
    engine = GuardrailEngine(DEFAULT_GUARDRAILS)
    case = make_test_case()
    decision, stopping_rule, _ = engine.evaluate_case(case)
    assert decision == "ALLOW"
    assert stopping_rule is None


def test_guardrail_blocks_non_retryable_fatal_error():
    engine = GuardrailEngine(DEFAULT_GUARDRAILS)
    case = make_test_case(error_code="ACCOUNT_CLOSED")
    decision, stopping_rule, _ = engine.evaluate_case(case)
    assert decision == "BLOCK"
    assert "Fatal non-retryable error" in stopping_rule


def test_guardrail_blocks_max_attempts_exceeded():
    engine = GuardrailEngine(DEFAULT_GUARDRAILS)
    case = make_test_case(attempts_count=3)
    decision, stopping_rule, _ = engine.evaluate_case(case)
    assert decision == "BLOCK"
    assert "Max contact limit" in stopping_rule


def test_guardrail_flags_high_value_for_human_review():
    engine = GuardrailEngine(DEFAULT_GUARDRAILS)
    case = make_test_case(amount=75000.0)  # > ₹50k
    decision, stopping_rule, _ = engine.evaluate_case(case)
    assert decision == "FLAG_FOR_REVIEW"
    assert "High-value transaction" in stopping_rule


def test_guardrail_blocks_when_active_promise_to_pay():
    engine = GuardrailEngine(DEFAULT_GUARDRAILS)
    future_date = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    case = make_test_case(promise_date=future_date)
    decision, stopping_rule, _ = engine.evaluate_case(case)
    assert decision == "BLOCK"
    assert "Active Promise-to-Pay" in stopping_rule
