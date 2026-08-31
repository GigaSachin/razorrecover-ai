import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RecoveryCase, CaseFilter } from '@/types'
import { api } from '@/services/api'
import { Card, Loading, ErrorState } from '@/components/common/Cards'
import { Search, Filter, ArrowRight, Sparkles, RefreshCw } from 'lucide-react'
import { formatCurrency, getStatusColor, getRiskColor, getPaymentMethodLabel, formatDate } from '@/utils/format'

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  const loadCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCases({
        search_query: searchQuery || undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
        payment_method: methodFilter !== 'all' ? (methodFilter as any) : undefined,
      })
      setCases(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [statusFilter, methodFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadCases()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recovery Cases Database</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete registry of failed payments, mandate declines, and overdue B2B receivables.
          </p>
        </div>

        <button
          onClick={loadCases}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors w-fit"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <Card className="border-slate-800 bg-slate-900/60 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, payment ID, or failure reason..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="diagnosed">Diagnosed</option>
              <option value="in_progress">In Progress / Scheduled</option>
              <option value="recovered">Recovered</option>
              <option value="escalated_to_human">Escalated to Human</option>
              <option value="failed">Failed / Guardrail Blocked</option>
            </select>
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="upi">UPI Intent &amp; QR</option>
              <option value="mandate">e-Mandate / NACH</option>
              <option value="card">Cards (Credit/Debit)</option>
              <option value="b2b_invoice">B2B Invoices</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Cases Table */}
      {loading ? (
        <Loading message="Fetching cases..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCases} />
      ) : (
        <Card className="border-slate-800 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Failure Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                      No cases found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{c.customer_name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{c.payment_id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{formatCurrency(c.amount)}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 uppercase">
                          {c.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate">{c.failure_reason}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusColor(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-emerald-400">{c.recovery_probability}%</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Inspect <ArrowRight className="w-3 h-3" />
                        </Link>
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
