import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { RecoveryCase, DiagnoseResponse } from '@/types'
import { api } from '@/services/api'
import { Card, Loading, ErrorState } from '@/components/common/Cards'
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  User,
  CreditCard,
  Phone,
  Mail,
} from 'lucide-react'
import { formatCurrency, getStatusColor, getRiskColor, getPaymentMethodLabel, formatDate } from '@/utils/format'

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnoseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const loadCase = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCaseById(id)
      setCaseData(data)
      const diag = await api.diagnoseCase(id)
      setDiagnosis(diag)
    } catch (err: any) {
      setError(err.message || 'Failed to load case details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCase()
  }, [id])

  const handleExecuteAction = async () => {
    if (!id) return
    try {
      setExecuting(true)
      setActionMessage(null)
      const res = await api.executeRecovery(id)
      setActionMessage(res.details)
      loadCase()
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`)
    } finally {
      setExecuting(false)
    }
  }

  if (loading) return <Loading message="Loading case details..." />
  if (error || !caseData) return <ErrorState message={error || 'Case not found'} onRetry={loadCase} />

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/cases" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cases Registry
      </Link>

      {/* Case Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{caseData.customer_name}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusColor(caseData.status)}`}>
              {caseData.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400 mt-1">Payment ID: {caseData.payment_id} | Case ID: {caseData.id}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">At-Risk Amount</span>
          <span className="text-3xl font-bold text-white">{formatCurrency(caseData.amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Payment Profile */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Customer Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="text-slate-200 font-medium">{caseData.customer_phone || '+91 98765 43210'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="text-slate-200 font-medium">{caseData.customer_email || 'customer@example.com'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Customer Tier</span>
                <span className="text-slate-200 font-medium capitalize">{caseData.metadata?.customer_tier || 'Standard'}</span>
              </div>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Transaction Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="text-slate-200 font-medium">{getPaymentMethodLabel(caseData.payment_method)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Error Code</span>
                <span className="font-mono text-amber-400 font-medium">{caseData.error_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Failure Description</span>
                <span className="text-slate-300 font-medium">{caseData.failure_reason}</span>
              </div>
              <div>
                <span className="text-slate-400 block">First Detected</span>
                <span className="text-slate-300 font-medium">{formatDate(caseData.created_at)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Diagnostics & Intervention Hub */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" /> Autonomous Recovery Diagnostics
            </h3>

            {diagnosis && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    AI Root Cause Analysis
                  </span>
                  <p className="text-slate-200 text-sm leading-relaxed">{diagnosis.root_cause}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <span className="text-blue-400 font-semibold uppercase tracking-wider block mb-1">
                      Recommended Strategy
                    </span>
                    <p className="text-white font-medium">{diagnosis.recommended_strategy}</p>
                    <span className="text-slate-400 mt-1 block">Optimal Window: {diagnosis.optimal_retry_window}</span>
                  </div>

                  <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Guardrail Decision
                    </span>
                    <p className="text-emerald-400 font-bold">{diagnosis.guardrail_decision}</p>
                    <span className="text-slate-400 mt-1 block">
                      {diagnosis.stopping_rule_triggered || 'Compliant with RBI & safety caps'}
                    </span>
                  </div>
                </div>

                {diagnosis.hinglish_message && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                      Hinglish Nudge Preview
                    </span>
                    <p className="text-slate-200 leading-relaxed font-sans">{diagnosis.hinglish_message}</p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleExecuteAction}
                    disabled={executing || diagnosis.guardrail_decision === 'BLOCK'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
                  >
                    <Send className="w-4 h-4" /> Dispatch Recovery Intervention
                  </button>

                  {actionMessage && (
                    <span className="text-xs font-semibold text-emerald-400">{actionMessage}</span>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Attempt Timeline */}
          <Card className="border-slate-800 bg-slate-900">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Intervention History</h3>
            <div className="space-y-3">
              {caseData.attempts.length === 0 ? (
                <p className="text-xs text-slate-500">No attempts logged yet.</p>
              ) : (
                caseData.attempts.map((att, index) => (
                  <div key={index} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">Attempt #{att.attempt_number}: {att.action}</span>
                      <p className="text-slate-400 mt-0.5">{att.details || 'Intervention sent via system'}</p>
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
      </div>
    </div>
  )
}
