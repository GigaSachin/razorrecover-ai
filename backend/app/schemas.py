from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# Payment Method & Status Types
PaymentMethod = Literal["upi", "card", "mandate", "netbanking", "wallet", "b2b_invoice", "emi"]
RiskLevel = Literal["critical", "high", "medium", "low"]
CaseStatus = Literal["new", "diagnosed", "recommended", "in_progress", "recovered", "failed", "abandoned", "escalated_to_human"]
PolicyStatus = Literal["passed", "flagged", "blocked"]
ExecutionStatus = Literal["pending", "executing", "completed", "failed", "scheduled"]


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str
    role: str
    name: str
    email: str
    expires_at: str



class RecoveryAttempt(BaseModel):
    id: str
    case_id: str
    attempt_number: int
    action: str
    channel: str = "system"  # upi_link, smart_retry, whatsapp_hinglish, sms, email, voice_bot, human_escalation
    result: Literal["success", "pending", "failed", "scheduled"]
    timestamp: str
    details: Optional[str] = None
    recovered_amount: float = 0.0


class RecoveryCase(BaseModel):
    id: str
    payment_id: str
    customer_id: str
    customer_name: str
    customer_phone: Optional[str] = "+91 98765 43210"
    customer_email: Optional[str] = "customer@example.com"
    amount: float
    currency: str = "INR"
    payment_method: PaymentMethod
    failure_reason: str
    error_code: str = "GATEWAY_TIMEOUT"
    risk_level: RiskLevel
    recovery_probability: int = Field(ge=0, le=100)
    status: CaseStatus
    created_at: str
    updated_at: str
    ai_diagnosis: Optional[str] = None
    ai_confidence: Optional[int] = None
    recommended_action: Optional[str] = None
    recommended_channel: Optional[str] = None
    policy_status: Optional[PolicyStatus] = "passed"
    guardrail_notes: Optional[str] = None
    execution_status: Optional[ExecutionStatus] = "pending"
    escalated_to_human: bool = False
    attempts: List[RecoveryAttempt] = Field(default_factory=list)
    revenue_recovered: float = 0.0
    promise_to_pay_date: Optional[str] = None
    scheduled_retry_time: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DiagnoseRequest(BaseModel):
    case_id: Optional[str] = None
    payment_id: Optional[str] = None
    customer_name: Optional[str] = "Customer"
    amount: float = 1000.0
    payment_method: PaymentMethod = "upi"
    failure_reason: str = "Network timeout at acquiring bank"
    error_code: str = "BAD_REQUEST_PAYMENT_TIMEDOUT"
    retry_count: int = 0
    customer_tier: str = "standard"


class DiagnoseResponse(BaseModel):
    case_id: Optional[str] = None
    model_used: str = "Google Gemini 1.5 Flash (RazorRecover Agent Engine)"
    root_cause: str
    recommended_strategy: str
    recommended_channel: str
    confidence_score: int
    estimated_recovery_probability: int
    optimal_retry_window: Optional[str] = None
    personalized_outreach_message: Optional[str] = None
    hinglish_message: Optional[str] = None
    policy_check: Dict[str, Any]
    guardrail_decision: Literal["ALLOW", "FLAG_FOR_REVIEW", "BLOCK"]
    stopping_rule_triggered: Optional[str] = None


class ExecuteRecoveryRequest(BaseModel):
    case_id: str
    channel_override: Optional[str] = None
    force_execution: bool = False
    custom_message: Optional[str] = None


class ExecuteRecoveryResponse(BaseModel):
    case_id: str
    success: bool
    status: CaseStatus
    execution_status: ExecutionStatus
    action_taken: str
    channel_used: str
    recovered_amount: float
    message_sent: Optional[str] = None
    audit_event_id: str
    details: str


class BatchRecoveryRequest(BaseModel):
    case_ids: Optional[List[str]] = None
    strategy: Literal["auto_ai", "aggressive", "conservative", "smart_mandate_only"] = "auto_ai"
    simulate_live: bool = False


class BatchRecoveryResultItem(BaseModel):
    case_id: str
    customer_name: str
    amount: float
    payment_method: str
    status_before: str
    status_after: str
    action_taken: str
    channel: str
    recovered_amount: float
    guardrail_status: str
    notes: str


class BatchRecoveryResponse(BaseModel):
    total_processed: int
    total_revenue_at_risk: float
    total_revenue_recovered: float
    recovery_rate_percent: float
    successful_recoveries_count: int
    scheduled_retries_count: int
    escalated_to_human_count: int
    guardrail_blocked_count: int
    results: List[BatchRecoveryResultItem]
    duration_ms: int
    batch_timestamp: str


class HinglishChatRequest(BaseModel):
    case_id: Optional[str] = None
    customer_message: str
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
    customer_name: Optional[str] = "Rahul"
    amount: Optional[float] = 1499.0
    failure_reason: Optional[str] = "UPI Intent Timed Out"
    due_date: Optional[str] = "Today"


class HinglishChatResponse(BaseModel):
    model_used: str = "Google Gemini 1.5 Flash (RazorRecover Agent Engine)"
    agent_reply: str
    language_detected: str
    intent_detected: str
    promise_to_pay_detected: bool
    promised_date: Optional[str] = None
    payment_link_generated: Optional[str] = None
    discount_offered_percent: Optional[int] = None
    sentiment: str
    next_recommended_step: str


class GuardrailSettings(BaseModel):
    max_retry_attempts: int = 3
    recovery_time_window_days: int = 14
    max_automatic_contact_attempts: int = 3
    high_value_threshold: float = 50000.0  # INR
    require_human_approval_above: float = 50000.0
    rbi_dunning_window_enabled: bool = True
    rbi_start_hour: int = 8  # 8 AM
    rbi_end_hour: int = 19  # 7 PM
    cooling_period_hours: int = 4
    enable_smart_retry_salary_timing: bool = True
    auto_stop_on_invalid_account: bool = True


class AuditEvent(BaseModel):
    id: str
    timestamp: str
    case_id: str
    event_type: str
    actor: Literal["ai_agent", "guardrail_engine", "human_analyst", "system", "policy_engine"]
    ai_decision: Optional[str] = None
    policy_decision: Optional[str] = None
    execution_result: Optional[str] = None
    revenue_impact: float = 0.0
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DashboardMetrics(BaseModel):
    total_revenue_at_risk: float
    total_revenue_recovered: float
    recovery_rate: float
    active_cases: int
    average_recovery_probability: float
    cases_this_month: int
    human_escalations_count: int
    guardrail_blocks_count: int
    revenue_recovered_by_channel: Dict[str, float]


class RecoveryTrendPoint(BaseModel):
    date: str
    recovered: float
    at_risk: float


class FailureReasonBreakdown(BaseModel):
    reason: str
    count: int
    percentage: float
    total_amount: float


class RecoveryFunnelStep(BaseModel):
    step: str
    count: int
    percentage: float
