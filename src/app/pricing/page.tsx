'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CouponInput from '@/components/CouponInput'
import PixCheckout from '@/components/PixCheckout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'
import {
  Check,
  Loader2,
  ArrowLeft,
  Sparkles,
  Crown,
  Zap,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface Plan {
  plan: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  duration_days: number
  amount_cents: number
  amount_brl: string
}

const PLAN_INFO: Record<string, { label: string; description: string; icon: any; gradient: string; popular?: boolean; savings?: string }> = {
  mensal: {
    label: 'Mensal',
    description: 'Acesso completo por 30 dias',
    icon: Zap,
    gradient: 'from-blue-500 to-blue-600'
  },
  trimestral: {
    label: 'Trimestral',
    description: '90 dias de acesso',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-pink-500',
    savings: 'Economize 10%'
  },
  semestral: {
    label: 'Semestral',
    description: '180 dias de acesso',
    icon: Sparkles,
    gradient: 'from-orange-500 to-red-500',
    popular: true,
    savings: 'Economize 20%'
  },
  anual: {
    label: 'Anual',
    description: '365 dias de acesso',
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-600',
    savings: 'Economize 30%'
  }
}

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMode, setPaymentMode] = useState<'one-off' | 'recurring'>('one-off')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getPlans()
        .then((res: any) => setPlans(res.data || []))
        .catch(e => console.error('Erro ao carregar planos:', e))
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated])

  if (authLoading || loading) {
    return (
      <>
        <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </>
    )
  }

  if (selectedPlan) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <button
              onClick={() => { setSelectedPlan(null); setPaid(false); setCouponCode(null) }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos planos
            </button>

            {paid ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pagamento confirmado!</h2>
                <p className="text-gray-600 mb-6">
                  Sua assinatura {PLAN_INFO[selectedPlan.plan]?.label} está ativa.
                </p>
                <button
                  onClick={() => router.push('/auth/account')}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold"
                >
                  Acessar plataforma
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <PixCheckout
                  plan={selectedPlan.plan}
                  amountCents={selectedPlan.amount_cents}
                  couponCode={couponCode}
                  mode={paymentMode}
                  onPaid={() => setPaid(true)}
                />
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha seu plano
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Acesso completo a questões, simulados, aulas em vídeo e estatísticas detalhadas
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-md p-1 inline-flex">
              <button
                onClick={() => setPaymentMode('one-off')}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                  paymentMode === 'one-off' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                Pagamento único
              </button>
              <button
                onClick={() => setPaymentMode('recurring')}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  paymentMode === 'recurring' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                PIX Automático
              </button>
            </div>
          </div>

          {paymentMode === 'recurring' && (
            <div className="max-w-2xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">PIX Automático (Recorrência via Bacen)</p>
                <p className="text-blue-700 mt-1">
                  Você autoriza uma vez no app do seu banco e os próximos pagamentos
                  acontecem sozinhos no vencimento. Pode cancelar quando quiser.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map(plan => {
              const info = PLAN_INFO[plan.plan]
              const Icon = info?.icon || Zap
              return (
                <div
                  key={plan.plan}
                  className={`relative rounded-3xl p-1 ${
                    info?.popular
                      ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl scale-105'
                      : 'bg-gray-200'
                  }`}
                >
                  {info?.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MAIS VENDIDO
                    </div>
                  )}
                  <div className="bg-white rounded-3xl p-6 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${info?.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{info?.label}</h3>
                    <p className="text-sm text-gray-500 mb-4">{info?.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">R$</span>
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.amount_brl.split('.')[0]}
                        </span>
                        <span className="text-xl text-gray-500">,{plan.amount_brl.split('.')[1]}</span>
                      </div>
                      {info?.savings && (
                        <span className="inline-block mt-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          {info.savings}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      <Feature>21k+ questões</Feature>
                      <Feature>Simulados ilimitados</Feature>
                      <Feature>Aulas em vídeo</Feature>
                      <Feature>Estatísticas detalhadas</Feature>
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-3 rounded-full font-bold transition-all ${
                        info?.popular
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {paymentMode === 'recurring' ? 'Assinar PIX Automático' : 'Assinar com PIX'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {paymentMode === 'one-off' && plans.length > 0 && (
            <div className="max-w-md mx-auto mt-8">
              <CouponInput
                plan="mensal"
                originalCents={plans.find(p => p.plan === 'mensal')?.amount_cents || 9990}
                onApply={setCouponCode}
              />
            </div>
          )}

          <div className="text-center mt-12 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Pagamento processado de forma segura via Woovi (PIX)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}
