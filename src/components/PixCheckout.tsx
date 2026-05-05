'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Copy, Check, Clock, AlertCircle, Tag } from 'lucide-react'
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
  amountCents: number
  couponCode?: string | null
  mode: 'one-off' | 'recurring'
  onPaid: () => void
  pollIntervalMs?: number
}

export default function PixCheckout({ plan, amountCents, couponCode, mode, onPaid, pollIntervalMs = 5000 }: Props) {
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

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Pague com PIX
        </h2>
        {couponCode ? (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-base text-gray-400 line-through">
                R$ {(amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                R$ {parseFloat(charge.amount_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              <Tag className="w-3 h-3" />
              Cupom <span className="font-mono">{couponCode}</span> aplicado
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mt-1">
            R$ {parseFloat(charge.amount_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
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
