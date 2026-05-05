'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  X
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Subscription {
  id: number
  plan: string
  plan_name?: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  end_date: string
  amount: number | null
}

interface SubscriptionInfo {
  hasActiveSubscription: boolean
  subscription: Subscription | null
  daysRemaining: number | null
}

// Fallback labels for legacy plan codes (mensal/trimestral/...)
const LEGACY_PLAN_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  custom: 'Personalizado',
  questoes: 'Questões',
  completo: 'Completo',
  premium: 'Premium'
}

const planDisplayName = (sub: Subscription): string => {
  const name = sub.plan_name || LEGACY_PLAN_LABELS[sub.plan] || sub.plan
  // Avoid duplication: API may return name as "Plano Premium"; we already
  // prefix "Plano " in the banner copy, so strip it here.
  return name.replace(/^Plano\s+/i, '')
}

export default function SubscriptionBanner() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const res: any = await apiClient.getMySubscription()
      setInfo(res.data)
    } catch (e) {
      console.error('Erro ao carregar assinatura:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !info || dismissed) return null

  const { hasActiveSubscription, subscription, daysRemaining } = info

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  // Sem nenhuma assinatura registrada
  if (!subscription) {
    return (
      <BannerCard
        variant="warning"
        icon={<AlertTriangle className="w-6 h-6" />}
        title="Você ainda não tem uma assinatura ativa"
        description="Sua conta foi criada, mas para acesso completo aos conteúdos exclusivos, contrate um plano."
        ctaLabel="Ver planos"
        ctaHref="/pricing"
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Expirada ou cancelada
  if (!hasActiveSubscription) {
    const isExpired = subscription.status === 'expired'
    return (
      <BannerCard
        variant="danger"
        icon={<XCircle className="w-6 h-6" />}
        title={isExpired ? 'Sua assinatura expirou' : 'Sua assinatura está cancelada'}
        description={
          isExpired
            ? `Sua assinatura ${planDisplayName(subscription)} venceu em ${formatDate(subscription.end_date)}. Renove para manter o acesso completo.`
            : 'Renove sua assinatura para voltar a ter acesso completo à plataforma.'
        }
        ctaLabel="Renovar agora"
        ctaHref="/pricing"
      />
    )
  }

  // Vencendo em até 7 dias
  if (daysRemaining !== null && daysRemaining <= 7) {
    return (
      <BannerCard
        variant="warning"
        icon={<AlertTriangle className="w-6 h-6" />}
        title={
          daysRemaining === 0
            ? 'Sua assinatura vence hoje'
            : `Sua assinatura vence em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}`
        }
        description={`Plano ${planDisplayName(subscription)} válido até ${formatDate(subscription.end_date)}. Renove antes do vencimento para não perder o acesso.`}
        ctaLabel="Renovar"
        ctaHref="/pricing"
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Ativa e tranquila — mostra info discreta
  return (
    <BannerCard
      variant="success"
      icon={<CheckCircle2 className="w-6 h-6" />}
      title={`Plano ${planDisplayName(subscription)} ativo`}
      description={`Acesso liberado até ${formatDate(subscription.end_date)}${daysRemaining !== null ? ` (${daysRemaining} dias restantes)` : ''}.`}
      onDismiss={() => setDismissed(true)}
    />
  )
}

interface BannerCardProps {
  variant: 'success' | 'warning' | 'danger'
  icon: React.ReactNode
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  onDismiss?: () => void
}

function BannerCard({ variant, icon, title, description, ctaLabel, ctaHref, onDismiss }: BannerCardProps) {
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      iconBg: 'bg-green-100 text-green-700',
      title: 'text-green-900',
      description: 'text-green-700',
      cta: 'bg-green-600 hover:bg-green-700 text-white'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300',
      iconBg: 'bg-yellow-100 text-yellow-700',
      title: 'text-yellow-900',
      description: 'text-yellow-800',
      cta: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300',
      iconBg: 'bg-red-100 text-red-700',
      title: 'text-red-900',
      description: 'text-red-800',
      cta: 'bg-red-600 hover:bg-red-700 text-white'
    }
  }
  const s = styles[variant]

  return (
    <div className={`relative rounded-2xl border ${s.bg} p-5 mb-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-full p-2 ${s.iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${s.title}`}>{title}</h3>
          <p className={`text-sm mt-1 ${s.description}`}>{description}</p>
        </div>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${s.cta}`}
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition ${s.title}`}
            aria-label="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
