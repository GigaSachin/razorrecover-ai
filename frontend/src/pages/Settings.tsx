import React, { useEffect, useState } from 'react'
import { GuardrailSettings } from '@/types'
import { api } from '@/services/api'
import { Card, Loading, ErrorState } from '@/components/common/Cards'
import { ShieldCheck, Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<GuardrailSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getGuardrailSettings()
      setSettings(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load guardrails settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    try {
      setSaving(true)
      setSaveSuccess(false)
      const updated = await api.saveGuardrailSettings(settings)
      setSettings(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save guardrail settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Loading guardrails settings..." />
  if (error || !settings) return <ErrorState message={error || 'Failed to load settings'} onRetry={loadSettings} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> RBI Compliance &amp; Policy Engine
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Guardrail &amp; Stopping Rules Console</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure deterministic safety caps, RBI contact windows, and stopping rules for autonomous recovery agents.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Safety Caps */}
        <Card className="border-slate-800 bg-slate-900">
          <h3 className="text-base font-bold text-white mb-4">Financial Safety &amp; Human-in-the-Loop Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                High-Value Escalation Threshold (INR)
              </label>
              <input
                type="number"
                value={settings.high_value_threshold}
                onChange={(e) => setSettings({ ...settings, high_value_threshold: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Transactions above this value require human analyst sign-off before dispatching recovery actions.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Max Automatic Contact Attempts Per Case
              </label>
              <input
                type="number"
                value={settings.max_automatic_contact_attempts}
                onChange={(e) => setSettings({ ...settings, max_automatic_contact_attempts: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Strict stopping rule: Autonomous outreach stops once this limit is hit.
              </span>
            </div>
          </div>
        </Card>

        {/* RBI Dunning Compliance Window */}
        <Card className="border-slate-800 bg-slate-900">
          <h3 className="text-base font-bold text-white mb-4">RBI Dunning Compliance Windows</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rbi_window"
                checked={settings.rbi_dunning_window_enabled}
                onChange={(e) => setSettings({ ...settings, rbi_dunning_window_enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="rbi_window" className="text-sm font-semibold text-slate-200">
                Enforce RBI Dunning Hours (8:00 AM to 7:00 PM IST)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Cooling-off Period Between Retries (Hours)
                </label>
                <input
                  type="number"
                  value={settings.cooling_period_hours}
                  onChange={(e) => setSettings({ ...settings, cooling_period_hours: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Prevents spamming customers with rapid consecutive payment reminders.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Recovery Validity Window (Days)
                </label>
                <input
                  type="number"
                  value={settings.recovery_time_window_days}
                  onChange={(e) => setSettings({ ...settings, recovery_time_window_days: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Cases older than this are moved to abandoned to maintain compliance.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" /> Save Guardrail Settings
          </button>

          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
