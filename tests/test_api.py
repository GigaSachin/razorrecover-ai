from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "RazorRecover" in data["service"]


def test_get_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue_at_risk" in data
    assert "total_revenue_recovered" in data
    assert "recovery_rate" in data
    assert data["total_revenue_at_risk"] > 0


def test_list_cases():
    response = client.get("/api/cases")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 10


def test_diagnose_case():
    cases_res = client.get("/api/cases")
    cases = cases_res.json()
    case_id = cases[0]["id"]

    response = client.post(f"/api/cases/{case_id}/diagnose")
    assert response.status_code == 200
    data = response.json()
    assert "root_cause" in data
    assert "recommended_strategy" in data
    assert "confidence_score" in data
    assert "guardrail_decision" in data


def test_batch_recovery_run():
    payload = {"strategy": "auto_ai"}
    response = client.post("/api/batch/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_processed"] > 0
    assert data["total_revenue_recovered"] > 0
    assert "results" in data
    assert len(data["results"]) == data["total_processed"]


def test_hinglish_chat_with_ptp():
    payload = {
        "customer_message": "Bhaiya abhi balance nahi hai, kal salary aate hi pakka pay kar dunga",
        "customer_name": "Suresh",
        "amount": 2499.0,
    }
    response = client.post("/api/chat/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["promise_to_pay_detected"] is True
    assert data["promised_date"] is not None
    assert "Suresh" in data["agent_reply"]


def test_guardrails_api():
    get_res = client.get("/api/guardrails")
    assert get_res.status_code == 200
    settings = get_res.json()
    assert settings["max_automatic_contact_attempts"] == 3

    settings["max_retry_attempts"] = 4
    post_res = client.post("/api/guardrails", json=settings)
    assert post_res.status_code == 200
    assert post_res.json()["max_retry_attempts"] == 4
