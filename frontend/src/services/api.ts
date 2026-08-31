/**
 * Real API client for RazorRecover AI connected to FastAPI backend
 */

import {
  RecoveryCase,
  AuditEvent,
  DashboardMetrics,
  RecoveryTrendPoint,
  FailureReasonBreakdown,
  RecoveryFunnelStep,
  GuardrailSettings,
  CaseFilter,
  DiagnoseResponse,
  ExecuteRecoveryResponse,
  BatchRecoveryResponse,
  BatchRecoveryRequest,
  HinglishChatRequest,
  HinglishChatResponse,
} from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port !== '5173'
    ? `${window.location.origin}/api`
    : 'http://localhost:8000/api')

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errText = await response.text()
    let errMsg = `Request failed: ${response.statusText}`
    try {
      const errJson = JSON.parse(errText)
      errMsg = errJson.detail || errMsg
    } catch {
      // ignore
    }
    throw new Error(errMsg)
  }
  return response.json()
}

export const api = {
  // Dashboard & Metrics
  getDashboardMetrics: (): Promise<DashboardMetrics> => request<DashboardMetrics>('/metrics'),
  getRecoveryTrend: (): Promise<RecoveryTrendPoint[]> => request<RecoveryTrendPoint[]>('/metrics/trend'),
  getFailureReasons: (): Promise<FailureReasonBreakdown[]> => request<FailureReasonBreakdown[]>('/metrics/failures'),
  getRecoveryFunnel: (): Promise<RecoveryFunnelStep[]> => request<RecoveryFunnelStep[]>('/metrics/funnel'),

  // Cases
  getCases: (filter?: CaseFilter): Promise<RecoveryCase[]> => {
    const params = new URLSearchParams()
    if (filter?.status) params.append('status', filter.status)
    if (filter?.risk_level) params.append('risk_level', filter.risk_level)
    if (filter?.payment_method) params.append('payment_method', filter.payment_method)
    if (filter?.search_query) params.append('search', filter.search_query)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return request<RecoveryCase[]>(`/cases${qs}`)
  },

  getActiveCases: (): Promise<RecoveryCase[]> => request<RecoveryCase[]>('/cases'),

  getCaseById: (caseId: string): Promise<RecoveryCase> => request<RecoveryCase>(`/cases/${caseId}`),

  diagnoseCase: (caseId: string): Promise<DiagnoseResponse> =>
    request<DiagnoseResponse>(`/cases/${caseId}/diagnose`, { method: 'POST' }),

  executeRecovery: (
    caseId: string,
    options?: { channel_override?: string; force_execution?: boolean; custom_message?: string },
  ): Promise<ExecuteRecoveryResponse> =>
    request<ExecuteRecoveryResponse>(`/cases/${caseId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, ...(options || {}) }),
    }),

  // Batch Autonomous Recovery ("The Bar")
  runBatchRecovery: (payload: BatchRecoveryRequest = { strategy: 'auto_ai' }): Promise<BatchRecoveryResponse> =>
    request<BatchRecoveryResponse>('/batch/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Hinglish Conversational Recovery & Promise-to-Pay Chat
  sendHinglishChat: (payload: HinglishChatRequest): Promise<HinglishChatResponse> =>
    request<HinglishChatResponse>('/chat/recover', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Guardrails & Compliance Settings
  getGuardrailSettings: (): Promise<GuardrailSettings> => request<GuardrailSettings>('/guardrails'),
  saveGuardrailSettings: (settings: GuardrailSettings): Promise<GuardrailSettings> =>
    request<GuardrailSettings>('/guardrails', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  // Audit Logs
  getAuditEvents: (limit: number = 50): Promise<AuditEvent[]> =>
    request<AuditEvent[]>(`/audit?limit=${limit}`),

  getRecentDecisions: (limit: number = 20): Promise<AuditEvent[]> =>
    request<AuditEvent[]>(`/audit?limit=${limit}`),

  // Authentication
  login: (credentials: { username: string; password: string }): Promise<{
    token: string
    username: string
    role: string
    name: string
    email: string
    expires_at: string
  }> =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Reset Demo Data
  resetDemoData: (): Promise<{ message: string }> =>
    request<{ message: string }>('/reset-data', { method: 'POST' }),
}
