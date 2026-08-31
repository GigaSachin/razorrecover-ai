export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercent = (value: number, decimals = 1): string => {
  return value.toFixed(decimals)
}

export const formatDate = (date: string | Date): string => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  } catch {
    return String(date)
  }
}

export const getRiskColor = (risk: string): string => {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    case 'high':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    case 'medium':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    case 'low':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'recovered':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    case 'failed':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    case 'in_progress':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    case 'escalated_to_human':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    case 'diagnosed':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    case 'recommended':
      return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    case 'abandoned':
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    default:
      return 'text-slate-300 bg-slate-500/10 border-slate-500/30'
  }
}

export const getPaymentMethodLabel = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'upi':
      return 'UPI Intent & QR'
    case 'mandate':
      return 'e-Mandate / NACH'
    case 'card':
      return 'Credit / Debit Card'
    case 'b2b_invoice':
      return 'B2B Invoice'
    case 'netbanking':
      return 'Net Banking'
    case 'wallet':
      return 'Prepaid Wallet'
    default:
      return method?.toUpperCase() || 'Payment'
  }
}
