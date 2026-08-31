/**
 * Core domain types for the AI Revenue Recovery Agent
 */

export type PaymentMethod = 'upi' | 'card' | 'mandate' | 'netbanking' | 'wallet' | 'b2b_invoice' | 'emi'
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type CaseStatus = 'new' | 'diagnosed' | 'recommended' | 'in_progress' | 'recovered' | 'failed' | 'abandoned' | 'escalated_to_human'
export type PolicyStatus = 'passed' | 'flagged' | 'blocked'
export type ExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'scheduled'

export interface RecoveryAttempt {
  id: string
  case_id: string
  attempt_number: number
  action: string
  channel: string
  result: 'success' | 'pending' | 'failed' | 'scheduled'
  timestamp: string
  details?: string
  recovered_amount?: number
}

export interface RecoveryCase {
  id: string
  payment_id: string
  customer_id: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  failure_reason: string
  error_code: string
  risk_level: RiskLevel
  recovery_probability: number
  status: CaseStatus
  created_at: string
  updated_at: string
  ai_diagnosis?: string
  ai_confidence?: number
  recommended_action?: string
  recommended_channel?: string
  policy_status?: PolicyStatus
  guardrail_notes?: string
  execution_status?: ExecutionStatus
  escalated_to_human?: boolean
  attempts: RecoveryAttempt[]
  revenue_recovered?: number
  promise_to_pay_date?: string
  scheduled_retry_time?: string
  metadata?: Record<string, any>
}

export interface AuditEvent {
  id: string
  timestamp: string
  case_id: string
  event_type: string
  actor: 'ai_agent' | 'guardrail_engine' | 'human_analyst' | 'system' | 'policy_engine'
  ai_decision?: string
  policy_decision?: string
  execution_result?: string
  revenue_impact: number
  description: string
  metadata?: Record<string, any>
}

export interface DashboardMetrics {
  total_revenue_at_risk: number
  total_revenue_recovered: number
  recovery_rate: number
  active_cases: number
  average_recovery_probability: number
  cases_this_month: number
  human_escalations_count: number
  guardrail_blocks_count: number
  revenue_recovered_by_channel: Record<string, number>
}

export interface RecoveryTrendPoint {
  date: string
  recovered: number
  at_risk: number
}

export interface FailureReasonBreakdown {
  reason: string
  count: number
  percentage: number
  total_amount: number
}

export interface RecoveryFunnelStep {
  step: string
  count: number
  percentage: number
}

export interface GuardrailSettings {
  max_retry_attempts: number
  recovery_time_window_days: number
  max_automatic_contact_attempts: number
  high_value_threshold: number
  require_human_approval_above: number
  rbi_dunning_window_enabled: boolean
  rbi_start_hour: number
  rbi_end_hour: number
  cooling_period_hours: number
  enable_smart_retry_salary_timing: boolean
  auto_stop_on_invalid_account: boolean
}

export interface CaseFilter {
  status?: CaseStatus
  risk_level?: RiskLevel
  payment_method?: PaymentMethod
  search_query?: string
}

export interface DiagnoseResponse {
  case_id?: string
  model_used?: string
  root_cause: string
  recommended_strategy: string
  recommended_channel: string
  confidence_score: number
  estimated_recovery_probability: number
  optimal_retry_window?: string
  personalized_outreach_message?: string
  hinglish_message?: string
  policy_check: Record<string, any>
  guardrail_decision: 'ALLOW' | 'FLAG_FOR_REVIEW' | 'BLOCK'
  stopping_rule_triggered?: string
}

export interface ExecuteRecoveryResponse {
  case_id: string
  success: boolean
  status: CaseStatus
  execution_status: ExecutionStatus
  action_taken: string
  channel_used: string
  recovered_amount: number
  message_sent?: string
  audit_event_id: string
  details: string
}

export interface BatchRecoveryResultItem {
  case_id: string
  customer_name: string
  amount: number
  payment_method: string
  status_before: string
  status_after: string
  action_taken: string
  channel: string
  recovered_amount: number
  guardrail_status: string
  notes: string
}

export interface BatchRecoveryResponse {
  total_processed: number
  total_revenue_at_risk: number
  total_revenue_recovered: number
  recovery_rate_percent: number
  successful_recoveries_count: number
  scheduled_retries_count: number
  escalated_to_human_count: number
  guardrail_blocked_count: number
  results: BatchRecoveryResultItem[]
  duration_ms: number
  batch_timestamp: string
}

export interface HinglishChatRequest {
  case_id?: string
  customer_message: string
  conversation_history?: Array<{ sender: string; text: string }>
  customer_name?: string
  amount?: number
  failure_reason?: string
  due_date?: string
}

export interface HinglishChatResponse {
  model_used?: string
  agent_reply: string
  language_detected: string
  intent_detected: string
  promise_to_pay_detected: boolean
  promised_date?: string
  payment_link_generated?: string
  discount_offered_percent?: number
  sentiment: string
  next_recommended_step: string
}
