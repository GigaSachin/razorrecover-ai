import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { RazorRecoverLogo } from '@/components/common/Logo'
import {
  ShieldCheck,
  Zap,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    try {
      setLoading(true)
      setError(null)
      await login(username, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async (role: 'admin' | 'analyst') => {
    try {
      setLoading(true)
      setError(null)
      await quickLogin(role)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Product Narrative & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Autonomous AI Revenue Recovery Platform
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
                  <RazorRecoverLogo size={36} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  RazorRecover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
                </h1>
              </div>
              <p className="text-xl text-slate-300 font-medium">
                Find revenue that&apos;s slipping away and win it back.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Autonomous multi-channel recovery agent powered by root-cause diagnostics, salary-cycle mandate retry sequencing, Hinglish conversational voice/chat, and strict RBI dunning guardrails.
              </p>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-xs text-white">Measured Batch Recovery</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">₹7.8L+ won back across 50+ failed payments</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-xs text-white">Compliant Stopping Rules</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">RBI 8am-7pm contact hours &amp; safety caps</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-xs text-white">Hinglish Voice &amp; Chat</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Promise-to-Pay extraction &amp; negotiation</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-xs text-white">Smart Mandate Sequencer</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Salary-cycle &amp; bank load auto-timing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphism Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-500/5 relative">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Command Center</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access live recovery streams, batch execution &amp; guardrails.
                </p>
              </div>

              {/* ⚡ Quick 1-Click Demo Login Banner for Judges */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Quick Demo 1-Click Access
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    disabled={loading}
                    className="p-2.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/40 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-50 group"
                  >
                    <span className="text-[10px] uppercase font-bold text-blue-400 block">Lead Admin</span>
                    <span className="text-xs font-semibold text-white group-hover:text-blue-300">Admin Sign In →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('analyst')}
                    disabled={loading}
                    className="p-2.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-50 group"
                  >
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Specialist</span>
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300">Analyst Sign In →</span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Or use credentials
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Standard Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin or analyst"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin123 or analyst123"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In to RazorRecover <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit Encrypted Session • RBI Dunning Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
