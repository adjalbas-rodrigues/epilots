'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Copy, Check, Clock, AlertCircle, Tag, FileQuestion, BookOpen, Video, Calendar } from 'lucide-react'
import apiClient from '@/lib/api'

interface ChargeResult {
  payment_id?: number
  correlation_id?: string
  woovi_subscription_id?: string
  plan: string
  amount_brl: string
  pix_qr_code: string | null
  pix_br_code: string | null
  payment_url?: string | null
  authorization_url?: string | null
  expires_at?: string
  interval_months?: number
}

interface Props {
  plan: string
  planName?: string
  planDurationDays?: number
  planFeatures?: { questions: boolean; courses: boolean; videos: boolean }
  amountCents: number
  couponCode?: string | null
  mode: 'one-off' | 'recurring'
  onPaid: () => void
  pollIntervalMs?: number
}

export default function PixCheckout({
  plan, planName, planDurationDays, planFeatures,
  amountCents, couponCode, mode, onPaid, pollIntervalMs = 5000
}: Props) {
  const [charge, setCharge] = useState<ChargeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    let cancelled = false
    const create = async () => {
      try {
        // PIX Automático (recorrente) desativado temporariamente — usar sempre one-off
        // const res: any = mode === 'recurring'
        //   ? await apiClient.createPixSubscription(plan)
        //   : await apiClient.createPixCharge(plan, couponCode || null)
        const res: any = await apiClient.createPixCharge(plan, couponCode || null)
        if (!cancelled) setCharge(res.data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Erro ao gerar PIX')
      }
    }
    create()
    return () => { cancelled = true }
  }, [plan, couponCode, mode])

  const pollStatus = useCallback(async () => {
    if (!charge?.correlation_id) return
    try {
      const res: any = await apiClient.getPaymentStatus(charge.correlation_id)
      if (res.data?.status === 'paid') {
        setPaid(true)
        onPaid()
      }
    } catch {}
  }, [charge?.correlation_id, onPaid])

  useEffect(() => {
    // Sempre poll: modo recorrente desativado por enquanto
    if (!charge || paid) return
    const interval = setInterval(pollStatus, pollIntervalMs)
    return () => clearInterval(interval)
  }, [charge, paid, pollStatus, pollIntervalMs])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-red-900">Erro ao gerar pagamento</p>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!charge) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    )
  }

  const finalBRL = parseFloat(charge.amount_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const originalBRL = (amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="space-y-5">
      {/* Order summary */}
      {planName && (
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Plano</p>
              <h3 className="text-lg font-bold text-gray-900">{planName}</h3>
            </div>
            {planDurationDays != null && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
                <Calendar className="w-3 h-3" />
                {planDurationDays} dias
              </div>
            )}
          </div>

          {planFeatures && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {planFeatures.questions && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs">
                  <FileQuestion className="w-3 h-3" /> Questões
                </span>
              )}
              {planFeatures.courses && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-800 rounded-full text-xs">
                  <BookOpen className="w-3 h-3" /> Curso
                </span>
              )}
              {planFeatures.videos && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-800 rounded-full text-xs">
                  <Video className="w-3 h-3" /> Vídeos
                </span>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 flex items-end justify-between">
            <div>
              {couponCode && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  <Tag className="w-3 h-3" />
                  <span className="font-mono">{couponCode}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              {couponCode && (
                <div className="text-sm text-gray-400 line-through">R$ {originalBRL}</div>
              )}
              <div className="text-2xl font-bold text-gray-900">R$ {finalBRL}</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Pague com PIX</h2>
        {!planName && couponCode && (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-base text-gray-400 line-through">R$ {originalBRL}</span>
              <span className="text-2xl font-bold text-gray-900">R$ {finalBRL}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              <Tag className="w-3 h-3" />
              Cupom <span className="font-mono">{couponCode}</span> aplicado
            </div>
          </div>
        )}
        {!planName && !couponCode && (
          <p className="text-gray-600 mt-1">R$ {finalBRL}</p>
        )}
      </div>

      {charge.pix_qr_code && (
        <div className="flex justify-center">
          <div className="p-4 bg-white border-4 border-gray-100 rounded-2xl">
            <img src={charge.pix_qr_code} alt="QR Code PIX" className="w-64 h-64" />
          </div>
        </div>
      )}

      {charge.pix_br_code && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ou copie o código PIX:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={charge.pix_br_code}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
            />
            <button
              onClick={() => handleCopy(charge.pix_br_code!)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* PIX Automático (recorrente) desativado temporariamente
      {mode === 'recurring' && charge.authorization_url && (
        <a
          href={charge.authorization_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700"
        >
          <span className="flex items-center justify-center gap-2">
            Autorizar renovação automática no app do banco
            <ExternalLink className="w-4 h-4" />
          </span>
        </a>
      )}
      */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Aguardando pagamento...</p>
          <p className="text-blue-700 mt-1">Atualiza automaticamente quando confirmado.</p>
        </div>
      </div>

      {charge.expires_at && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>QR Code válido até {new Date(charge.expires_at).toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  )
}
