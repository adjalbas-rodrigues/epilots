'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CouponInput from '@/components/CouponInput'
import PixCheckout from '@/components/PixCheckout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'
import {
  Check, X, Loader2, ArrowLeft, CheckCircle2, AlertCircle,
  FileQuestion, BookOpen, Video, FileDown, Sparkles
} from 'lucide-react'

interface Plan {
  plan: string
  name: string
  duration_days: number
  amount_cents: number
  amount_brl: string
  description?: string
  savings_label?: string | null
  access_questions?: boolean
  access_courses?: boolean
  access_videos?: boolean
  access_materials?: boolean
}

const FEATURE_LIST = [
  { key: 'access_questions', label: '21k+ questões e simulados', icon: FileQuestion },
  { key: 'access_courses', label: 'Curso de exercícios', icon: BookOpen },
  { key: 'access_videos', label: 'Aulas em vídeo', icon: Video },
  { key: 'access_materials', label: 'Materiais para download', icon: FileDown },
]

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  // PIX Automático (recurring) desativado temporariamente — sempre one-off
  const [paymentMode] = useState<'one-off' | 'recurring'>('one-off')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [personalCouponCode, setPersonalCouponCode] = useState<string | null>(null)
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

      // Pre-fill personal coupon if the student has one
      apiClient.getMyPersonalCoupon()
        .then((res: any) => {
          if (res.data?.code) setPersonalCouponCode(res.data.code)
        })
        .catch(e => console.error('Erro ao buscar cupom pessoal:', e))
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
                  Sua assinatura {selectedPlan.name} está ativa.
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
                  planName={selectedPlan.name}
                  planDurationDays={selectedPlan.duration_days}
                  planFeatures={{
                    questions: !!selectedPlan.access_questions,
                    courses: !!selectedPlan.access_courses,
                    videos: !!selectedPlan.access_videos,
                    materials: !!selectedPlan.access_materials,
                  }}
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
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha seu plano
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pagamento via PIX. Renove mensalmente para manter o acesso.
            </p>
          </div>

          {/* PIX Automático desativado temporariamente — toggle removido
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-md p-1 inline-flex">
              <button
                onClick={() => setPaymentMode('recurring')}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  paymentMode === 'recurring' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                PIX Automático
              </button>
              <button
                onClick={() => setPaymentMode('one-off')}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                  paymentMode === 'one-off' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                Pagamento único
              </button>
            </div>
          </div>
          */}

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, idx) => {
              const isPremium = plan.access_videos
              const isMiddle = idx === 1
              return (
                <div
                  key={plan.plan}
                  className={`relative rounded-3xl p-1 ${
                    isMiddle
                      ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl scale-105'
                      : 'bg-gray-200'
                  }`}
                >
                  {plan.savings_label && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                      {plan.savings_label}
                    </div>
                  )}
                  <div className="bg-white rounded-3xl p-6 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      isMiddle ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{plan.description || `${plan.duration_days} dias`}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">R$</span>
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.amount_brl.split('.')[0]}
                        </span>
                        <span className="text-xl text-gray-500">,{plan.amount_brl.split('.')[1]}</span>
                        <span className="text-sm text-gray-500 ml-1">/mês</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {FEATURE_LIST.map(f => {
                        const enabled = (plan as any)[f.key]
                        const Icon = f.icon
                        return (
                          <li key={f.key} className={`flex items-start gap-2 text-sm ${enabled ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                            {enabled ? (
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${enabled ? 'text-gray-500' : 'text-gray-300'}`} />
                            <span>{f.label}</span>
                          </li>
                        )
                      })}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-3 rounded-full font-bold transition-all ${
                        isMiddle
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Assinar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {paymentMode === 'one-off' && plans.length > 0 && (
            <div className="max-w-md mx-auto mt-8">
              <CouponInput
                plan={plans[0].plan}
                originalCents={plans[0].amount_cents}
                initialCode={personalCouponCode}
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
