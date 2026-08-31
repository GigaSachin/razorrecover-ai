import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RecoveryCase, DiagnoseResponse } from '@/types'
import { api } from '@/services/api'
import { Card, Badge, Loading, ErrorState, EmptyState } from '@/components/common/Cards'
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  User,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Send,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatPercent, getRiskColor, getStatusColor, formatDate, getPaymentMethodLabel } from '@/utils/format'

export const RecoveryCenterPage: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([])
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnoseResponse | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCases()
      setCases(data)
      if (data.length > 0) {
        setSelectedCase(data[0])
        handleDiagnose(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recovery cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  const handleSelectCase = (c: RecoveryCase) => {
    setSelectedCase(c)
    setExecutionResult(null)
    handleDiagnose(c.id)
  }

  const handleDiagnose = async (caseId: string) => {
    try {
      setDiagnosing(true)
      const diag = await api.diagnoseCase(caseId)
      setDiagnosis(diag)
    } catch (err) {
      console.error(err)
    } finally {
      setDiagnosing(false)
    }
  }

  const handleExecute = async () => {
    if (!selectedCase) return
    try {
      setExecuting(true)
      setExecutionResult(null)
      const res = await api.executeRecovery(selectedCase.id)
      setExecutionResult(res.details)
      // Reload updated case
      const updated = await api.getCaseById(selectedCase.id)
      setSelectedCase(updated)
      setCases((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err: any) {
      setExecutionResult(`Error: ${err.message}`)
    } finally {
      setExecuting(false)
    }
  }

  if (loading) return <Loading message="Loading recovery cases..." />
  if (error) return <ErrorState message={error} onRetry={loadCases} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Triage &amp; Recovery Workflow
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Recovery Inspector</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time payment failure diagnosis, strategy optimization, and compliant intervention dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/batch-recovery"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Switch to Batch Mode
          </Link>
          <Link
            to="/hinglish-chat"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Hinglish Bot Simulator
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-230px)] overflow-y-auto border-slate-800 p-3">
            <div className="flex items-center justify-between px-2 py-1 mb-3 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Failed Payments ({cases.length})
              </h2>
            </div>
            <div className="space-y-2">
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedCase?.id === c.id
                      ? 'bg-blue-600/20 border-blue-500/60 shadow-md'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{c.customer_name}</span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{c.failure_reason}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="font-bold text-white">{formatCurrency(c.amount)}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{getPaymentMethodLabel(c.payment_method)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Case Deep Dive & AI Inspector */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header Card */}
            <Card className="border-slate-800 bg-slate-900/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedCase.customer_name}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-400 mt-1">Payment ID: {selectedCase.payment_id} | Case: {selectedCase.id}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">At-Risk Amount</span>
                  <span className="text-2xl font-bold text-white">{formatCurrency(selectedCase.amount)}</span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">Method</span>
                  <span className="font-semibold text-white mt-0.5 block">{getPaymentMethodLabel(selectedCase.payment_method)}</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">Error Code</span>
                  <span className="font-mono font-semibold text-amber-400 mt-0.5 block">{selectedCase.error_code}</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">Recovery Probability</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{selectedCase.recovery_probability}%</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">Attempts Made</span>
                  <span className="font-semibold text-blue-400 mt-0.5 block">{selectedCase.attempts.length} / 3</span>
                </div>
              </div>
            </Card>

            {/* AI Diagnosis & Strategy Inspector */}
            <Card className="border-slate-800 bg-slate-900/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> AI Root Cause &amp; Recommended Strategy
                </h3>
                {diagnosis?.model_used && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    ⚡ {diagnosis.model_used}
                  </span>
                )}
                {diagnosing && <span className="text-xs text-blue-400 animate-pulse">Analyzing failure...</span>}
              </div>

              {diagnosis && (
                <div className="space-y-4">
                  {/* Root cause analysis */}
                  <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-sm">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Root Cause Diagnosis
                    </span>
                    <p className="text-slate-200">{diagnosis.root_cause}</p>
                  </div>

                  {/* Recommended Strategy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <span className="text-blue-400 font-semibold uppercase tracking-wider block mb-1">
                        Optimal Intervention Channel
                      </span>
                      <span className="text-sm font-bold text-white block capitalize">{diagnosis.recommended_channel.replace('_', ' ')}</span>
                      <span className="text-slate-400 mt-1 block">Timing: {diagnosis.optimal_retry_window}</span>
                    </div>

                    <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Compliance Guardrail Decision
                      </span>
                      <span
                        className={`text-sm font-bold block ${
                          diagnosis.guardrail_decision === 'ALLOW'
                            ? 'text-emerald-400'
                            : diagnosis.guardrail_decision === 'FLAG_FOR_REVIEW'
                            ? 'text-purple-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {diagnosis.guardrail_decision}
                      </span>
                      <span className="text-slate-400 mt-1 block">
                        {diagnosis.stopping_rule_triggered || 'Passed all RBI & financial safety checks'}
                      </span>
                    </div>
                  </div>

                  {/* Hinglish outreach preview */}
                  {diagnosis.hinglish_message && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Generated Hinglish Customer Nudge
                      </span>
                      <p className="text-slate-200 leading-relaxed font-sans">{diagnosis.hinglish_message}</p>
                    </div>
                  )}

                  {/* Action Execution Button */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      onClick={handleExecute}
                      disabled={executing || diagnosis.guardrail_decision === 'BLOCK'}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg ${
                        diagnosis.guardrail_decision === 'BLOCK'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-emerald-500/20 hover:scale-[1.02]'
                      }`}
                    >
                      {executing ? (
                        <>
                          <Zap className="w-4 h-4 animate-spin" /> Executing Recovery Action...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Dispatch AI Recovery Intervention
                        </>
                      )}
                    </button>

                    {executionResult && (
                      <span className="text-xs text-emerald-400 font-semibold">{executionResult}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Attempt Timeline */}
            <Card className="border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Recovery Attempt History</h3>
              <div className="space-y-2">
                {selectedCase.attempts.length === 0 ? (
                  <p className="text-xs text-slate-500">No attempts logged yet.</p>
                ) : (
                  selectedCase.attempts.map((att, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/40 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200">Attempt #{att.attempt_number}: {att.action}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">{att.details || 'Intervention executed'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${att.result === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                          {att.result}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{formatDate(att.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
