import React from 'react'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable }) => (
  <div
    className={clsx(
      'bg-gradient-to-br from-slate-900 to-slate-900/95 border border-slate-800/50 rounded-xl p-6',
      'hover:border-slate-700/50 transition-all duration-300',
      hoverable && 'hover:shadow-xl hover:shadow-blue-500/10 hover:bg-slate-900/90',
      className,
    )}
  >
    {children}
  </div>
)

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className }) => {
  const variantClasses = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: { value: number; direction: 'up' | 'down' }
  icon?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, trend, icon }) => (
  <Card hoverable>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{label}</p>
        <div className="mt-2 flex items-baseline gap-3">
          <p className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{value}</p>
          {trend && (
            <span className={clsx('text-sm font-semibold flex items-center gap-1', trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400')}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
      </div>
      {icon && <div className="text-slate-600/50 ml-4 flex-shrink-0">{icon}</div>}
    </div>
  </Card>
)

interface LoadingProps {
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border border-slate-700 border-t-blue-500 mb-3"></div>
    <p className="text-slate-400 text-sm">{message}</p>
  </div>
)

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="text-slate-600 mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
    {action}
  </div>
)

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-red-500 mb-3">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
    <p className="text-slate-400 text-sm mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
)
