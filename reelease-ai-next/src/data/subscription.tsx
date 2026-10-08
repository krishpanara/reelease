import { AlertCircle, CheckCircle2, Clock, RotateCcw, XCircle, Users, CreditCard } from 'lucide-react'
import React from 'react'

export const subscriptionStatusConfig: Record<string, { labelKey: string; className: string; icon: React.ReactNode }> =
  {
    active: {
      labelKey: 'active',
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    cancelled: {
      labelKey: 'cancelled',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: <XCircle className="w-3 h-3" />,
    },
    past_due: {
      labelKey: 'past_due',
      className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    incomplete: {
      labelKey: 'processing',
      className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      icon: <Clock className="w-3 h-3 animate-pulse" />,
    },
    trialing: {
      labelKey: 'trialing',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: <RotateCcw className="w-3 h-3" />,
    },
    expired: {
      labelKey: 'expired',
      className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      icon: <XCircle className="w-3 h-3" />,
    },
    cancelling: {
      labelKey: 'cancelling',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: <XCircle className="w-3 h-3" />,
    },
  }

export const subscriptionHistoryFilters = ['all', 'active', 'expired', 'cancelled'] as const

export const subscriptionStatus = ['active', 'past_due', 'cancelled', 'trialing', 'expired', 'changed']

export const subscriptionStatsConfig = [
  {
    key: 'total_subscriptions',
    labelKey: 'total_subscriptions',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'total_revenue',
    labelKey: 'total_revenue',
    icon: CreditCard,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    isCurrency: true,
  },
  {
    key: 'current_subscriptions',
    labelKey: 'current_subscriptions',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    key: 'subscriptions_expired',
    labelKey: 'subscriptions_expired',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    key: 'expiring_soon',
    labelKey: 'expiring_soon',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
]

export const getCurrencySymbol = (currency?: string) => {
  switch (currency?.toUpperCase()) {
    case 'INR':
      return '₹'
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    default:
      return '$'
  }
}