from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from backend.app.schemas import (
    AuditEvent,
    BatchRecoveryRequest,
    BatchRecoveryResponse,
    BatchRecoveryResultItem,
    RecoveryAttempt,
    RecoveryCase,
)
from backend.app.services.ai_agent import ai_agent
from backend.app.services.data_service import (
    create_audit_event,
    get_case_by_id,
    load_cases,
    update_case,
)


class BatchRecoveryEngine:
    """
    Batch Recovery Execution & Simulation Engine.
    Demonstrates measured financial recovery across batches with
    strict compliant stopping rules and full audit trails.
    """

    def run_batch(self, request: BatchRecoveryRequest) -> BatchRecoveryResponse:
        start_time = time.time()
        now_str = datetime.now(timezone.utc).isoformat()

        all_cases_data = load_cases()
        if request.case_ids:
            target_data = [c for c in all_cases_data if c["id"] in request.case_ids]
        else:
            target_data = all_cases_data

        cases: List[RecoveryCase] = [RecoveryCase(**c) for c in target_data]

        total_processed = len(cases)
        total_revenue_at_risk = sum(c.amount for c in cases)
        total_revenue_recovered = 0.0
        successful_recoveries = 0
        scheduled_retries = 0
        escalated_to_human = 0
        guardrail_blocked = 0
        results: List[BatchRecoveryResultItem] = []

        for case in cases:
            status_before = case.status

            # If already recovered, record as recovered
            if case.status == "recovered":
                total_revenue_recovered += case.amount
                successful_recoveries += 1
                results.append(
                    BatchRecoveryResultItem(
                        case_id=case.id,
                        customer_name=case.customer_name,
                        amount=case.amount,
                        payment_method=case.payment_method,
                        status_before=status_before,
                        status_after="recovered",
                        action_taken="Already recovered in previous cycle",
                        channel=case.recommended_channel or "system",
                        recovered_amount=case.amount,
                        guardrail_status="PASSED",
                        notes="Case previously settled",
                    )
                )
                continue

            # 1. Run AI Diagnosis & Guardrails
            diagnosis = ai_agent.diagnose_case(case)
            case.ai_diagnosis = diagnosis.root_cause
            case.ai_confidence = diagnosis.confidence_score
            case.recommended_action = diagnosis.recommended_strategy
            case.recommended_channel = diagnosis.recommended_channel

            # 2. Check Guardrail Decision
            if diagnosis.guardrail_decision == "BLOCK":
                guardrail_blocked += 1
                case.policy_status = "blocked"
                case.guardrail_notes = diagnosis.stopping_rule_triggered
                case.status = "failed"
                case.updated_at = now_str

                # Audit Log
                create_audit_event(
                    AuditEvent(
                        id=f"audit_{uuid.uuid4().hex[:10]}",
                        timestamp=now_str,
                        case_id=case.id,
                        event_type="GUARDRAIL_BLOCKED",
                        actor="guardrail_engine",
                        policy_decision=diagnosis.stopping_rule_triggered,
                        revenue_impact=0.0,
                        description=f"Automated recovery halted by stopping rule: {diagnosis.stopping_rule_triggered}",
                    )
                )

                results.append(
                    BatchRecoveryResultItem(
                        case_id=case.id,
                        customer_name=case.customer_name,
                        amount=case.amount,
                        payment_method=case.payment_method,
                        status_before=status_before,
                        status_after="failed",
                        action_taken="Execution Blocked by Guardrail",
                        channel=diagnosis.recommended_channel,
                        recovered_amount=0.0,
                        guardrail_status="BLOCKED",
                        notes=diagnosis.stopping_rule_triggered or "Guardrail safety trigger",
                    )
                )

            elif diagnosis.guardrail_decision == "FLAG_FOR_REVIEW":
                escalated_to_human += 1
                case.policy_status = "flagged"
                case.escalated_to_human = True
                case.status = "escalated_to_human"
                case.guardrail_notes = diagnosis.stopping_rule_triggered
                case.updated_at = now_str

                create_audit_event(
                    AuditEvent(
                        id=f"audit_{uuid.uuid4().hex[:10]}",
                        timestamp=now_str,
                        case_id=case.id,
                        event_type="HUMAN_ESCALATION_TRIGGERED",
                        actor="guardrail_engine",
                        policy_decision="HIGH_VALUE_THRESHOLD_EXCEEDED",
                        revenue_impact=0.0,
                        description=f"Transaction value ₹{case.amount:,.2f} exceeds auto threshold. Handed over to human recovery team.",
                    )
                )

                results.append(
                    BatchRecoveryResultItem(
                        case_id=case.id,
                        customer_name=case.customer_name,
                        amount=case.amount,
                        payment_method=case.payment_method,
                        status_before=status_before,
                        status_after="escalated_to_human",
                        action_taken="Escalated to Human Specialist",
                        channel="human_analyst",
                        recovered_amount=0.0,
                        guardrail_status="FLAGGED_FOR_REVIEW",
                        notes="High-value compliant review required",
                    )
                )

            else:
                # ALLOWED: Autonomous Recovery Workflow Execution
                case.policy_status = "passed"
                attempt_id = f"att_{uuid.uuid4().hex[:8]}"

                if "salary" in diagnosis.recommended_strategy.lower() or "mandate" in case.payment_method:
                    # Scheduled Retry Workflow
                    scheduled_retries += 1
                    case.status = "in_progress"
                    case.execution_status = "scheduled"
                    case.scheduled_retry_time = diagnosis.optimal_retry_window
                    case.updated_at = now_str

                    attempt = RecoveryAttempt(
                        id=attempt_id,
                        case_id=case.id,
                        attempt_number=len(case.attempts) + 1,
                        action=diagnosis.recommended_strategy,
                        channel=diagnosis.recommended_channel,
                        result="scheduled",
                        timestamp=now_str,
                        details=f"Scheduled auto-debit for {diagnosis.optimal_retry_window}",
                    )
                    case.attempts.append(attempt)

                    create_audit_event(
                        AuditEvent(
                            id=f"audit_{uuid.uuid4().hex[:10]}",
                            timestamp=now_str,
                            case_id=case.id,
                            event_type="MANDATE_RETRY_SCHEDULED",
                            actor="ai_agent",
                            ai_decision=diagnosis.recommended_strategy,
                            execution_result="SCHEDULED",
                            revenue_impact=0.0,
                            description=f"Optimized retry scheduled for {diagnosis.optimal_retry_window}",
                        )
                    )

                    results.append(
                        BatchRecoveryResultItem(
                            case_id=case.id,
                            customer_name=case.customer_name,
                            amount=case.amount,
                            payment_method=case.payment_method,
                            status_before=status_before,
                            status_after="in_progress",
                            action_taken=f"Scheduled: {diagnosis.recommended_strategy}",
                            channel=diagnosis.recommended_channel,
                            recovered_amount=0.0,
                            guardrail_status="PASSED",
                            notes=f"Optimal window: {diagnosis.optimal_retry_window}",
                        )
                    )

                else:
                    # Immediate Autonomous Nudge / 1-Click UPI Recovery
                    successful_recoveries += 1
                    recovered_amt = case.amount
                    total_revenue_recovered += recovered_amt

                    case.status = "recovered"
                    case.execution_status = "completed"
                    case.revenue_recovered = recovered_amt
                    case.updated_at = now_str

                    attempt = RecoveryAttempt(
                        id=attempt_id,
                        case_id=case.id,
                        attempt_number=len(case.attempts) + 1,
                        action=diagnosis.recommended_strategy,
                        channel=diagnosis.recommended_channel,
                        result="success",
                        timestamp=now_str,
                        details="Payment recovered via 1-click intelligent nudge",
                        recovered_amount=recovered_amt,
                    )
                    case.attempts.append(attempt)

                    create_audit_event(
                        AuditEvent(
                            id=f"audit_{uuid.uuid4().hex[:10]}",
                            timestamp=now_str,
                            case_id=case.id,
                            event_type="REVENUE_RECOVERED",
                            actor="ai_agent",
                            ai_decision=diagnosis.recommended_strategy,
                            execution_result="SUCCESS",
                            revenue_impact=recovered_amt,
                            description=f"Won back ₹{recovered_amt:,.2f} via {diagnosis.recommended_channel}",
                        )
                    )

                    results.append(
                        BatchRecoveryResultItem(
                            case_id=case.id,
                            customer_name=case.customer_name,
                            amount=case.amount,
                            payment_method=case.payment_method,
                            status_before=status_before,
                            status_after="recovered",
                            action_taken=diagnosis.recommended_strategy,
                            channel=diagnosis.recommended_channel,
                            recovered_amount=recovered_amt,
                            guardrail_status="PASSED",
                            notes="Recovered in batch execution",
                        )
                    )

            # Persist updated case
            update_case(case.model_dump(mode="json"))

        duration_ms = int((time.time() - start_time) * 1000)
        recovery_rate = (
            round((total_revenue_recovered / total_revenue_at_risk) * 100, 2)
            if total_revenue_at_risk > 0
            else 0.0
        )

        return BatchRecoveryResponse(
            total_processed=total_processed,
            total_revenue_at_risk=total_revenue_at_risk,
            total_revenue_recovered=total_revenue_recovered,
            recovery_rate_percent=recovery_rate,
            successful_recoveries_count=successful_recoveries,
            scheduled_retries_count=scheduled_retries,
            escalated_to_human_count=escalated_to_human,
            guardrail_blocked_count=guardrail_blocked,
            results=results,
            duration_ms=duration_ms,
            batch_timestamp=now_str,
        )


batch_engine = BatchRecoveryEngine()
