import React, { useState } from 'react'
import { api } from '@/services/api'
import { BatchRecoveryResponse, BatchRecoveryResultItem } from '@/types'
import { Card, MetricCard, Badge } from '@/components/common/Cards'
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatPercent, getStatusColor } from '@/utils/format'

export const BatchRecoveryPage: React.FC = () => {
  const [running, setRunning] = useState(false)
  const [batchResult, setBatchResult] = useState<BatchRecoveryResponse | null>(null)
  const [strategy, setStrategy] = useState<'auto_ai' | 'conservative' | 'aggressive' | 'smart_mandate_only'>('auto_ai')
  const [error, setError] = useState<string | null>(null)
  const [filterResult, setFilterResult] = useState<'all' | 'recovered' | 'scheduled' | 'escalated' | 'blocked'>('all')

  const handleRunBatch = async () => {
    try {
      setRunning(true)
      setError(null)
      const res = await api.runBatchRecovery({ strategy })
      setBatchResult(res)
    } catch (err: any) {
      setError(err.message || 'Failed to execute batch recovery')
    } finally {
      setRunning(false)
    }
  }

  const handleResetData = async () => {
    try {
      setRunning(true)
      await api.resetDemoData()
      setBatchResult(null)
      alert('Demo cases successfully reset to initial states!')
    } catch (err: any) {
      alert('Failed to reset: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  const filteredItems = batchResult?.results.filter((item: BatchRecoveryResultItem) => {
    if (filterResult === 'recovered') return item.status_after === 'recovered'
    if (filterResult === 'scheduled') return item.status_after === 'in_progress'
    if (filterResult === 'escalated') return item.status_after === 'escalated_to_human'
    if (filterResult === 'blocked') return item.guardrail_status === 'BLOCKED'
    return true
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Throughput Autonomous Recovery
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Autonomous Batch Recovery Runner</h1>
          <p className="text-slate-400 text-sm mt-1">
            Execute measured AI revenue recovery across a batch of failed transactions with strict stopping rules & audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" /> Reset Batch Data
          </button>
          <button
            onClick={handleRunBatch}
            disabled={running}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {running ? (
              <>
                <Zap className="w-4 h-4 animate-spin" /> Processing AI Agents...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Run Batch Recovery
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Panel & Strategy Selector */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
              Recovery Engine Strategy
            </label>
            <select
              value={strategy}
              onChange={(e: any) => setStrategy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="auto_ai">🤖 Auto AI (Multi-Channel Adaptive)</option>
              <option value="smart_mandate_only">📅 Smart Mandate Salary Sequencer</option>
              <option value="conservative">🛡️ Conservative (Strict Guardrails)</option>
              <option value="aggressive">⚡ High Velocity (Instant UPI Links)</option>
            </select>
          </div>

          <div className="md:col-span-3 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <span className="text-blue-400 font-semibold">Autonomous Workflow:</span> Evaluates failure root causes, schedules salary-timed mandate auto-debits, generates 1-click UPI recovery links, enforces RBI contact limits, and escalates transactions &gt; ₹50,000 to human specialists.
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Measured Money Recovered Across Batch (The Bar Showcase) */}
      {batchResult && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Key Scorecard Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue at Risk"
              value={formatCurrency(batchResult.total_revenue_at_risk)}
              icon={<Clock className="w-6 h-6" />}
              subtext={`${batchResult.total_processed} total transactions evaluated`}
            />

            <MetricCard
              label="Measured Money Won Back"
              value={formatCurrency(batchResult.total_revenue_recovered)}
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              trend={{ value: batchResult.recovery_rate_percent, direction: 'up' }}
              subtext="Directly recovered & reconciled"
            />

            <MetricCard
              label="Recovery Success Rate"
              value={`${formatPercent(batchResult.recovery_rate_percent)}%`}
              icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
              subtext={`${batchResult.successful_recoveries_count} instant recoveries completed`}
            />

            <MetricCard
              label="Compliant Guardrail Actions"
              value={batchResult.escalated_to_human_count + batchResult.guardrail_blocked_count}
              icon={<ShieldAlert className="w-6 h-6 text-amber-400" />}
              subtext={`${batchResult.escalated_to_human_count} high-value escalations, ${batchResult.guardrail_blocked_count} stopped`}
            />
          </div>

          {/* Detailed Batch Breakdown & Outcome Tabs */}
          <Card className="border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Batch Execution Stream</h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  Processed in {batchResult.duration_ms}ms
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50 text-xs">
                <button
                  onClick={() => setFilterResult('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterResult === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({batchResult.results.length})
                </button>
                <button
                  onClick={() => setFilterResult('recovered')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterResult === 'recovered'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Recovered ({batchResult.successful_recoveries_count})
                </button>
                <button
                  onClick={() => setFilterResult('scheduled')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterResult === 'scheduled'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-400 hover:text-blue-400'
                  }`}
                >
                  Scheduled ({batchResult.scheduled_retries_count})
                </button>
                <button
                  onClick={() => setFilterResult('escalated')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterResult === 'escalated'
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-slate-400 hover:text-purple-400'
                  }`}
                >
                  Escalated ({batchResult.escalated_to_human_count})
                </button>
                <button
                  onClick={() => setFilterResult('blocked')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterResult === 'blocked'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  Stopping Rules ({batchResult.guardrail_blocked_count})
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Customer & Case</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Method</th>
                    <th className="pb-3 px-3">Action Executed</th>
                    <th className="pb-3 px-3">Guardrail Status</th>
                    <th className="pb-3 px-3">Result</th>
                    <th className="pb-3 px-3">Recovered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item: BatchRecoveryResultItem) => (
                    <tr key={item.case_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{item.customer_name}</div>
                        <div className="font-mono text-xs text-slate-400">{item.case_id}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-white">{formatCurrency(item.amount)}</td>

                      <td className="py-3 px-3">
                        <span className="text-xs uppercase px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                          {item.payment_method}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-xs text-slate-200 line-clamp-1 font-medium">{item.action_taken}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{item.notes}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded border font-medium ${
                            item.guardrail_status === 'PASSED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.guardrail_status === 'FLAGGED_FOR_REVIEW'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {item.guardrail_status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(item.status_after)}`}>
                          {item.status_after.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold">
                        {item.recovered_amount > 0 ? (
                          <span className="text-emerald-400">+{formatCurrency(item.recovered_amount)}</span>
                        ) : (
                          <span className="text-slate-500">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State before run */}
      {!batchResult && !running && (
        <Card className="text-center py-16 border-dashed border-slate-800 bg-slate-900/30">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to Demonstrate Measured Revenue Recovery</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm mb-6">
            Click &quot;Run Batch Recovery&quot; to execute the multi-channel agent across 50 failed transactions. Watch real rupees get recovered with compliant escalation and stopping rules.
          </p>
          <button
            onClick={handleRunBatch}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> Start Batch Execution
          </button>
        </Card>
      )}
    </div>
  )
}
