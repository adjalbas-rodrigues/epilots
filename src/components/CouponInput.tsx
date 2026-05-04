'use client'

import { useState } from 'react'
import { Tag, Loader2, X, Check } from 'lucide-react'
import apiClient from '@/lib/api'

interface ValidationResult {
  code: string
  original_cents: number
  discount_cents: number
  final_cents: number
}

interface Props {
  plan: string
  originalCents: number
  onApply: (code: string | null) => void
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CouponInput({ plan, originalCents, onApply }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<ValidationResult | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const upper = code.trim().toUpperCase()
      const res: any = await apiClient.validateCoupon(upper, plan)
      setApplied(res.data)
      onApply(res.data.code)
    } catch (e: any) {
      setError(e?.message || 'Cupom inválido')
      setApplied(null)
      onApply(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setApplied(null)
    setError(null)
    onApply(null)
  }

  if (applied) {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <Check className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-900">
                Cupom <span className="font-mono">{applied.code}</span> aplicado
              </p>
              <p className="text-sm text-green-700 mt-1">
                Desconto de {formatBRL(applied.discount_cents)}
              </p>
              <p className="text-base font-bold text-gray-900 mt-2">
                Total: {formatBRL(applied.final_cents)}
                <span className="ml-2 text-sm font-normal text-gray-500 line-through">
                  {formatBRL(applied.original_cents)}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-700 hover:text-green-900 flex-shrink-0"
            aria-label="Remover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Tem um cupom?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Insira o cupom"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg uppercase font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Aplicar
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
