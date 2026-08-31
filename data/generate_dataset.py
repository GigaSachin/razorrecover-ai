from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "cases.json"

CUSTOMERS = [
    {"name": "Rahul Sharma", "phone": "+91 98112 34567", "email": "rahul.sharma@gmail.com"},
    {"name": "Priya Patel", "phone": "+91 98223 45678", "email": "priya.patel@outlook.com"},
    {"name": "Amit Verma", "phone": "+91 98334 56789", "email": "amit.v@techcorp.in"},
    {"name": "Neha Gupta", "phone": "+91 98445 67890", "email": "neha.gupta@finscale.io"},
    {"name": "Vikram Malhotra", "phone": "+91 98556 78901", "email": "vikram.m@zenith.com"},
    {"name": "Ananya Iyer", "phone": "+91 98667 89012", "email": "ananya.iyer@gmail.com"},
    {"name": "Siddharth Rao", "phone": "+91 98778 90123", "email": "siddharth.r@hyperloop.in"},
    {"name": "Kavita Reddy", "phone": "+91 98889 01234", "email": "kavita.reddy@reddyinfra.com"},
    {"name": "Rohan Deshmukh", "phone": "+91 98990 12345", "email": "rohan.d@pulsepay.com"},
    {"name": "Sneha Nair", "phone": "+91 98101 23456", "email": "sneha.nair@nairconsulting.com"},
]

SCENARIOS = [
    {
        "payment_method": "upi",
        "failure_reason": "Bank PSP network timeout during UPI Intent authorization",
        "error_code": "BAD_REQUEST_PAYMENT_TIMEDOUT",
        "risk_level": "medium",
        "recovery_probability": 88,
        "amount_range": (499, 4500),
    },
    {
        "payment_method": "mandate",
        "failure_reason": "Insufficient balance at time of recurring mandate auto-debit",
        "error_code": "INSUFFICIENT_FUNDS",
        "risk_level": "high",
        "recovery_probability": 78,
        "amount_range": (999, 12000),
    },
    {
        "payment_method": "card",
        "failure_reason": "Card 3D Secure OTP verification timeout or session abandoned",
        "error_code": "CUSTOMER_DROPPED_OFF",
        "risk_level": "medium",
        "recovery_probability": 82,
        "amount_range": (1499, 8500),
    },
    {
        "payment_method": "b2b_invoice",
        "failure_reason": "B2B Net-30 invoice overdue beyond grace period",
        "error_code": "INVOICE_OVERDUE",
        "risk_level": "high",
        "recovery_probability": 86,
        "amount_range": (45000, 185000),
    },
    {
        "payment_method": "netbanking",
        "failure_reason": "Acquiring bank core banking gateway temporarily degraded",
        "error_code": "GATEWAY_DOWN",
        "risk_level": "low",
        "recovery_probability": 94,
        "amount_range": (2500, 15000),
    },
    {
        "payment_method": "mandate",
        "failure_reason": "Customer revoked e-mandate on bank portal",
        "error_code": "USER_REVOKED_MANDATE",
        "risk_level": "critical",
        "recovery_probability": 25,
        "amount_range": (2999, 9999),
    },
    {
        "payment_method": "upi",
        "failure_reason": "Fatal: Invalid VPA handle or permanent bank rejection",
        "error_code": "INVALID_VPA_PERMANENT",
        "risk_level": "critical",
        "recovery_probability": 10,
        "amount_range": (1200, 5000),
    },
    {
        "payment_method": "b2b_invoice",
        "failure_reason": "Enterprise software license renewal pending CFO approval",
        "error_code": "PENDING_CFO_SIGN_OFF",
        "risk_level": "high",
        "recovery_probability": 91,
        "amount_range": (120000, 450000),
    },
]


def generate_cases(count: int = 50) -> list[dict]:
    cases = []
    base_time = datetime.now(timezone.utc) - timedelta(days=5)

    for i in range(1, count + 1):
        cust = CUSTOMERS[(i - 1) % len(CUSTOMERS)]
        scenario = SCENARIOS[(i - 1) % len(SCENARIOS)]

        created_dt = base_time + timedelta(hours=i * 2.2)
        created_str = created_dt.isoformat()

        # Generate realistic amount
        min_a, max_a = scenario["amount_range"]
        amount = float(min_a + ((i * 733) % (max_a - min_a + 1)))

        # Status distribution: Most are new or diagnosed, some already in_progress or recovered
        if i % 7 == 0:
            status = "recovered"
            rev_rec = amount
        elif i % 5 == 0:
            status = "in_progress"
            rev_rec = 0.0
        elif scenario["error_code"] in {"USER_REVOKED_MANDATE", "INVALID_VPA_PERMANENT"}:
            status = "new"
            rev_rec = 0.0
        else:
            status = "diagnosed" if i % 2 == 0 else "new"
            rev_rec = 0.0

        case = {
            "id": f"case_{i:03d}",
            "payment_id": f"pay_rzp_{100000 + i}",
            "customer_id": f"cust_{2000 + (i % len(CUSTOMERS))}",
            "customer_name": f"{cust['name']}",
            "customer_phone": cust["phone"],
            "customer_email": cust["email"],
            "amount": amount,
            "currency": "INR",
            "payment_method": scenario["payment_method"],
            "failure_reason": scenario["failure_reason"],
            "error_code": scenario["error_code"],
            "risk_level": scenario["risk_level"],
            "recovery_probability": scenario["recovery_probability"],
            "status": status,
            "created_at": created_str,
            "updated_at": created_str,
            "ai_diagnosis": f"AI Triage: {scenario['failure_reason']}. High-confidence strategy selected.",
            "ai_confidence": min(98, scenario["recovery_probability"] + 5),
            "recommended_action": "Smart Recovery Nudge via Razorpay 1-Click Link",
            "recommended_channel": "upi_link" if scenario["payment_method"] == "upi" else "smart_retry",
            "policy_status": "passed",
            "guardrail_notes": None,
            "execution_status": "completed" if status == "recovered" else "pending",
            "escalated_to_human": amount >= 50000.0,
            "attempts": [
                {
                    "id": f"att_{i}_1",
                    "case_id": f"case_{i:03d}",
                    "attempt_number": 1,
                    "action": "Initial payment attempt",
                    "channel": scenario["payment_method"],
                    "result": "failed",
                    "timestamp": created_str,
                    "details": scenario["failure_reason"],
                    "recovered_amount": 0.0,
                }
            ],
            "revenue_recovered": rev_rec,
            "promise_to_pay_date": None,
            "scheduled_retry_time": None,
            "metadata": {
                "customer_tier": "enterprise" if amount > 50000 else "standard",
                "bank": "HDFC" if i % 2 == 0 else "ICICI",
            },
        }
        cases.append(case)

    return cases


if __name__ == "__main__":
    cases = generate_cases(50)
    OUTPUT.write_text(json.dumps({"cases": cases}, indent=2), encoding="utf-8")
    print(f"Successfully generated {len(cases)} realistic Indian payment cases at {OUTPUT}")
