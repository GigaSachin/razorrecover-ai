import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Menu,
  X,
  BarChart3,
  Zap,
  List,
  Settings,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  LogOut,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react'
import { RazorRecoverLogo } from './Logo'
import clsx from 'clsx'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 ml-0 lg:ml-64 pt-20">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, quickLogin } = useAuth()
  const navigate = useNavigate()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSwitchRole = async () => {
    const nextRole = user?.role === 'admin' ? 'analyst' : 'admin'
    await quickLogin(nextRole)
    setProfileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 z-40 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-slate-900 rounded-lg p-1.5 border border-slate-700/60">
                  <RazorRecoverLogo size={24} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    RazorRecover <span className="text-blue-400 font-mono text-sm">AI</span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Autonomous Revenue Recovery for Razorpay</p>
              </div>
            </Link>
          </div>

          {/* Right: Live Pill & User Profile Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300 font-medium">Agent Active &amp; Reconciling</span>
            </div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-semibold text-white block leading-tight">{user.name}</span>
                    <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Role: {user.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="pt-1.5 space-y-1 text-xs">
                      <button
                        onClick={handleSwitchRole}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Switch to {user.role === 'admin' ? 'Analyst' : 'Admin'}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navItems = [
    { path: '/', label: 'Executive Dashboard', icon: BarChart3 },
    { path: '/batch-recovery', label: 'Batch Recovery Runner', icon: Zap, badge: 'Auto-Settle' },
    { path: '/recovery-center', label: 'AI Case Inspector', icon: Sparkles },
    { path: '/hinglish-chat', label: 'Hinglish Recovery Bot', icon: MessageSquare, badge: 'Voice/Chat' },
    { path: '/cases', label: 'Failed Payments & Cases', icon: List },
    { path: '/audit', label: 'Audit & Compliance Trail', icon: ShieldCheck },
    { path: '/settings', label: 'Guardrail Rules', icon: Settings },
  ]

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity z-30',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <nav
        className={clsx(
          'fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 transition-transform z-30',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:top-0 lg:w-64 lg:fixed',
        )}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon, badge }: any) => (
              <Link
                key={path}
                to={path}
                onClick={() => onClose()}
                className={clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all group',
                  isActive(path)
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={clsx('w-4 h-4 transition-transform', isActive(path) && 'text-white')} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={clsx(
                      'text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full',
                      isActive(path) ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-semibold mb-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>Razorpay Network</span>
              </div>
              <p className="text-[11px] text-slate-500">Autonomous Revenue Recovery Engine</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
