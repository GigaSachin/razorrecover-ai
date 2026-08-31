from __future__ import annotations

from backend.app.schemas import HinglishChatRequest, RecoveryCase
from backend.app.services.ai_agent import AIRecoveryAgent


def test_diagnose_upi_timeout():
    agent = AIRecoveryAgent()
    case = RecoveryCase(
        id="case_upi_01",
        payment_id="pay_upi_999",
        customer_id="cust_01",
        customer_name="Aditya Verma",
        amount=1999.0,
        payment_method="upi",
        failure_reason="Network timeout at issuing bank",
        error_code="BAD_REQUEST_PAYMENT_TIMEDOUT",
        risk_level="medium",
        recovery_probability=85,
        status="new",
        created_at="2026-08-31T10:00:00Z",
        updated_at="2026-08-31T10:00:00Z",
    )
    diag = agent.diagnose_case(case)
    assert "UPI" in diag.root_cause or "gateway" in diag.root_cause
    assert diag.recommended_channel == "upi_link"
    assert diag.confidence_score >= 85
    assert diag.guardrail_decision == "ALLOW"
    assert "Namaste Aditya Verma" in (diag.hinglish_message or "")


def test_diagnose_insufficient_funds_mandate():
    agent = AIRecoveryAgent()
    case = RecoveryCase(
        id="case_mandate_01",
        payment_id="pay_man_111",
        customer_id="cust_02",
        customer_name="Pooja Sen",
        amount=4999.0,
        payment_method="mandate",
        failure_reason="Insufficient balance in bank account",
        error_code="INSUFFICIENT_FUNDS",
        risk_level="high",
        recovery_probability=75,
        status="new",
        created_at="2026-08-31T10:00:00Z",
        updated_at="2026-08-31T10:00:00Z",
    )
    diag = agent.diagnose_case(case)
    assert "salary" in diag.recommended_strategy.lower() or "mandate" in diag.recommended_strategy.lower()
    assert diag.recommended_channel == "smart_retry"


def test_hinglish_negotiator_discount_intent():
    agent = AIRecoveryAgent()
    req = HinglishChatRequest(
        customer_message="Sir yeh price thoda zyada costly lag raha hai, kuch discount mil sakta hai kya?",
        customer_name="Karan",
        amount=5000.0,
    )
    res = agent.handle_hinglish_chat(req)
    assert res.intent_detected == "PRICE_SENSITIVITY"
    assert res.discount_offered_percent == 10
    assert "Karan" in res.agent_reply
    assert "https://rzp.io/i/disc10_karan" in (res.payment_link_generated or "")
