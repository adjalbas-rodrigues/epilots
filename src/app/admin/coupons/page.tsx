'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Tag,
  X
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Coupon {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: string | number
  max_uses: number | null
  used_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
}

const formatDiscount = (c: Coupon) => {
  const value = parseFloat(c.discount_value as string)
  if (c.discount_type === 'percent') return `${Math.round(value)}%`
  return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getCoupons()
      setCoupons(res.data || [])
    } catch (e) {
      console.error('Erro ao carregar cupons:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleNew = () => { setEditing(null); setShowModal(true) }
  const handleEdit = (c: Coupon) => { setEditing(c); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditing(null) }

  const handleToggle = async (c: Coupon) => {
    try {
      await apiClient.toggleCoupon(c.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao alternar cupom')
    }
  }

  const handleDelete = async (c: Coupon) => {
    if (!window.confirm(`Excluir cupom ${c.code}?`)) return
    try {
      await apiClient.deleteCoupon(c.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir cupom')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cupons</h1>
          <p className="text-gray-600 mt-2">Gerencie cupons de desconto</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cupom
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Carregando...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Código</th>
                <th className="px-6 py-3 text-left">Desconto</th>
                <th className="px-6 py-3 text-left">Usos</th>
                <th className="px-6 py-3 text-left">Validade</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDiscount(c)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.used_count} / {c.max_uses ?? '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(c)}
                        className="text-gray-600 hover:text-gray-900"
                        title={c.is_active ? 'Desativar' : 'Ativar'}
                        aria-label={c.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {c.is_active
                          ? <ToggleRight className="w-5 h-5" />
                          : <ToggleLeft className="w-5 h-5" />
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-yellow-600 hover:text-yellow-800"
                        aria-label="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CouponModal
          editing={editing}
          onClose={handleClose}
          onSaved={async () => { handleClose(); await load() }}
        />
      )}
    </div>
  )
}

interface ModalProps {
  editing: Coupon | null
  onClose: () => void
  onSaved: () => Promise<void>
}

function CouponModal({ editing, onClose, onSaved }: ModalProps) {
  const [code, setCode] = useState(editing?.code || '')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(editing?.discount_type || 'percent')
  const [discountValue, setDiscountValue] = useState<string>(
    editing ? String(editing.discount_value) : '10'
  )
  const [maxUses, setMaxUses] = useState<string>(
    editing?.max_uses != null ? String(editing.max_uses) : ''
  )
  const [validFrom, setValidFrom] = useState(editing?.valid_from || '')
  const [validUntil, setValidUntil] = useState(editing?.valid_until || '')
  const [isActive, setIsActive] = useState(editing?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!code.trim() && !editing) {
      alert('Código é obrigatório')
      return
    }
    const value = parseFloat(discountValue)
    if (!Number.isFinite(value) || value <= 0) {
      alert('Valor do desconto deve ser positivo')
      return
    }

    setSaving(true)
    try {
      const payload = {
        discount_type: discountType,
        discount_value: value,
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        valid_from: validFrom || null,
        valid_until: validUntil || null,
        is_active: isActive
      }
      if (editing) {
        await apiClient.updateCoupon(editing.id, payload)
      } else {
        await apiClient.createCoupon({ ...payload, code: code.trim() })
      }
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar cupom')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editing ? `Editar cupom ${editing.code}` : 'Novo Cupom'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!editing && (
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase font-mono"
              />
            </div>
          )}

          <div>
            <label htmlFor="dtype" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              id="dtype"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (centavos)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dvalue" className="block text-sm font-medium text-gray-700 mb-1">
              Valor do desconto {discountType === 'percent' ? '(%)' : '(em centavos, ex: 2000 = R$ 20,00)'}
            </label>
            <input
              id="dvalue"
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="maxuses" className="block text-sm font-medium text-gray-700 mb-1">
              Limite de usos (vazio = ilimitado)
            </label>
            <input
              id="maxuses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Ex: 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vfrom" className="block text-sm font-medium text-gray-700 mb-1">Válido de</label>
              <input
                id="vfrom"
                type="date"
                value={validFrom || ''}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="vuntil" className="block text-sm font-medium text-gray-700 mb-1">Válido até</label>
              <input
                id="vuntil"
                type="date"
                value={validUntil || ''}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Ativo</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
