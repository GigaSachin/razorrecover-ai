import React, { useEffect, useState } from 'react'
import { AuditEvent } from '@/types'
import { api } from '@/services/api'
import { Card, Loading, ErrorState } from '@/components/common/Cards'
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export const AuditTrailPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actorFilter, setActorFilter] = useState<string>('all')

  const loadAudit = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAuditEvents(100)
      setEvents(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudit()
  }, [])

  const filteredEvents = events.filter((e) => {
    if (actorFilter === 'all') return true
    return e.actor === actorFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit &amp; Compliance Trail
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete chronological record of all AI decisions, guardrail safety triggers, and financial recoveries.
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors w-fit"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Trail
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" /> Filter by Actor:
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['all', 'ai_agent', 'guardrail_engine', 'human_analyst', 'system'].map((actor) => (
              <button
                key={actor}
                onClick={() => setActorFilter(actor)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  actorFilter === actor
                    ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {actor.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      {loading ? (
        <Loading message="Loading immutable audit logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAudit} />
      ) : (
        <Card className="border-slate-800 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Revenue Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No audit events found. Run a batch recovery to generate live events.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">{formatDate(e.timestamp)}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 text-xs">{e.event_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded border uppercase font-medium ${
                            e.actor === 'ai_agent'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : e.actor === 'guardrail_engine'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {e.actor.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{e.case_id}</td>
                      <td className="py-3 px-4 text-xs text-slate-300 max-w-md">{e.description}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {e.revenue_impact > 0 ? (
                          <span className="text-emerald-400">+{formatCurrency(e.revenue_impact)}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
