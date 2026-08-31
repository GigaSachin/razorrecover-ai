import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { DashboardMetrics, RecoveryTrendPoint, FailureReasonBreakdown, RecoveryFunnelStep, AuditEvent } from '@/types'
import { api } from '@/services/api'
import { Card, MetricCard, Loading, ErrorState } from '@/components/common/Cards'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { formatCurrency, formatPercent, formatDate } from '@/utils/format'

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [trend, setTrend] = useState<RecoveryTrendPoint[]>([])
  const [failures, setFailures] = useState<FailureReasonBreakdown[]>([])
  const [funnel, setFunnel] = useState<RecoveryFunnelStep[]>([])
  const [decisions, setDecisions] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [metricsData, trendData, failuresData, funnelData, decisionsData] = await Promise.all([
        api.getDashboardMetrics(),
        api.getRecoveryTrend(),
        api.getFailureReasons(),
        api.getRecoveryFunnel(),
        api.getRecentDecisions(10),
      ])

      setMetrics(metricsData)
      setTrend(trendData)
      setFailures(failuresData)
      setFunnel(funnelData)
      setDecisions(decisionsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading message="Connecting to RazorRecover AI Engine..." />
  if (error) return <ErrorState message={error} onRetry={loadData} />
  if (!metrics) return null

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Revenue Intelligence &amp; Triage
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Recovery Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous multi-channel recovery agent powered by smart diagnostics, retry sequencing &amp; compliant guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/batch-recovery"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 fill-current" /> Run Batch Recovery
          </Link>
        </div>
      </div>

      {/* High-Level Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue at Risk"
          value={formatCurrency(metrics.total_revenue_at_risk)}
          icon={<AlertCircle className="w-6 h-6 text-amber-400" />}
          subtext={`${metrics.cases_this_month} failed transactions detected`}
        />

        <MetricCard
          label="Revenue Won Back"
          value={formatCurrency(metrics.total_revenue_recovered)}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          trend={{ value: metrics.recovery_rate, direction: 'up' }}
          subtext="Directly settled &amp; reconciled"
        />

        <MetricCard
          label="Realized Recovery Rate"
          value={`${formatPercent(metrics.recovery_rate)}%`}
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
          subtext={`Avg confidence: ${metrics.average_recovery_probability}%`}
        />

        <MetricCard
          label="Compliant Guardrail Actions"
          value={metrics.human_escalations_count + metrics.guardrail_blocks_count}
          icon={<ShieldCheck className="w-6 h-6 text-indigo-400" />}
          subtext={`${metrics.human_escalations_count} high-value escalations, ${metrics.guardrail_blocks_count} safety blocks`}
        />
      </div>

      {/* Recovery Trend & Root Cause Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Revenue Recovery Over Time</h3>
              <p className="text-xs text-slate-400">Comparing total at-risk revenue vs. AI-recovered revenue</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Area type="monotone" dataKey="at_risk" name="Revenue at Risk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" name="Revenue Recovered" stroke="#10b981" fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Root Causes Pie Chart */}
        <Card className="border-slate-800">
          <h3 className="font-bold text-white text-base mb-1">Failure Root Causes</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across error codes</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failures.slice(0, 5)}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {failures.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {failures.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                  <span className="text-slate-300 truncate">{f.reason}</span>
                </div>
                <span className="text-slate-400 font-semibold">{f.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recovery Funnel & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Funnel */}
        <Card className="border-slate-800">
          <h3 className="font-bold text-white text-base mb-1">Autonomous Recovery Pipeline Funnel</h3>
          <p className="text-xs text-slate-400 mb-4">End-to-end transition from failure detection to money won back</p>
          <div className="space-y-3">
            {funnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{step.step}</span>
                  <span className="text-blue-400 font-bold">{step.count} ({step.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(step.percentage, 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Immutable Audit Stream */}
        <Card className="border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-base">Recent AI Decisions &amp; Audit Trail</h3>
            <Link to="/audit" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {decisions.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No decisions recorded yet. Run a batch recovery to generate audit events.</div>
            ) : (
              decisions.map((event) => (
                <div key={event.id} className="p-2.5 bg-slate-800/40 border border-slate-700/40 rounded-lg text-xs flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {event.event_type.includes('RECOVERED') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : event.event_type.includes('BLOCKED') ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{event.event_type}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="text-slate-400 line-clamp-1 mt-0.5">{event.description}</p>
                    {event.revenue_impact > 0 && (
                      <span className="text-emerald-400 font-semibold block mt-0.5">
                        +{formatCurrency(event.revenue_impact)} won back
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
