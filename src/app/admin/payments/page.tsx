'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2, Check, Plus, X, Search, Banknote
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Payment {
  id: number
  student_id: number
  plan: string
  amount_cents: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed'
  provider: string
  correlation_id: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
  coupon_code?: string | null
  discount_cents?: number | null
  student?: { id: number; name: string; email: string }
}

interface Plan {
  id: number
  code: string
  name: string
  price_cents: number
  is_active: boolean
}

interface Student {
  id: number
  name: string
  email: string
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR')

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showManual, setShowManual] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getAdminPayments({
        page,
        limit: 20,
        status: statusFilter,
        search: search || undefined
      })
      setPayments(res.data?.payments || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch (e) {
      console.error('Erro ao carregar pagamentos:', e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const handleApprove = async (p: Payment) => {
    if (!window.confirm(
      `Aprovar pagamento #${p.id} de ${p.student?.name || 'aluno'}? ` +
      `Valor: ${formatBRL(p.amount_cents)}. Isso vai ativar a assinatura.`
    )) return
    try {
      await apiClient.approvePayment(p.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao aprovar pagamento')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pagamentos</h1>
          <p className="text-gray-600 mt-2">Aprove pagamentos manuais e acompanhe o histórico</p>
        </div>
        <button
          onClick={() => setShowManual(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Cobrança Manual
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
              <option value="expired">Expirados</option>
              <option value="cancelled">Cancelados</option>
              <option value="failed">Falhos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Carregando...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Banknote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Nenhum pagamento encontrado
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Aluno</th>
                <th className="px-6 py-3 text-left">Plano</th>
                <th className="px-6 py-3 text-left">Valor</th>
                <th className="px-6 py-3 text-left">Método</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Criado</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map(p => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{p.student?.name || `#${p.student_id}`}</div>
                      <div className="text-xs text-gray-500">{p.student?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">{p.plan}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {formatBRL(p.amount_cents)}
                      {p.discount_cents ? (
                        <div className="text-xs text-green-600">desconto: {formatBRL(p.discount_cents)}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">{p.payment_method || p.provider}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(p)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                        >
                          <Check className="w-3 h-3" />
                          Aprovar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Anterior</button>
            <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Próximo</button>
          </div>
        )}
      </div>

      {showManual && (
        <ManualPaymentModal
          onClose={() => setShowManual(false)}
          onSaved={async () => { setShowManual(false); await load() }}
        />
      )}
    </div>
  )
}

interface ManualModalProps {
  onClose: () => void
  onSaved: () => Promise<void>
}

function ManualPaymentModal({ onClose, onSaved }: ManualModalProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentId, setStudentId] = useState<number | null>(null)
  const [planCode, setPlanCode] = useState('')
  const [amountBRL, setAmountBRL] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient.getPlansAdmin()
      .then((res: any) => {
        const list = (res.data || []).filter((p: Plan) => p.is_active)
        setPlans(list)
        if (list.length && !planCode) {
          setPlanCode(list[0].code)
          setAmountBRL((list[0].price_cents / 100).toFixed(2))
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    apiClient.getStudents(1, 30, studentSearch || undefined)
      .then((res: any) => setStudents(res.data?.students || []))
      .catch(console.error)
  }, [studentSearch])

  const handlePlanChange = (code: string) => {
    setPlanCode(code)
    const p = plans.find(x => x.code === code)
    if (p) setAmountBRL((p.price_cents / 100).toFixed(2))
  }

  const handleSave = async () => {
    if (!studentId) return alert('Selecione um aluno')
    if (!planCode) return alert('Selecione um plano')
    const cents = Math.round(parseFloat(amountBRL.replace(',', '.')) * 100)
    if (!Number.isFinite(cents) || cents <= 0) return alert('Valor inválido')

    setSaving(true)
    try {
      await apiClient.createManualPayment({
        student_id: studentId,
        plan: planCode,
        amount_cents: cents,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined
      })
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao registrar pagamento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Cobrança Manual</h2>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
              {students.map(s => (
                <button key={s.id} type="button" onClick={() => setStudentId(s.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${studentId === s.id ? 'bg-blue-100' : ''}`}>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.email}</div>
                </button>
              ))}
              {students.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">Nenhum aluno</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select id="plan" value={planCode} onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {plans.map(p => (
                  <option key={p.id} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input id="amount" type="number" step="0.01" min="0.01" value={amountBRL}
                onChange={(e) => setAmountBRL(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-500 mt-1">Dê um desconto reduzindo o valor</p>
            </div>
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
            <input id="method" type="text" value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ex: PIX manual, dinheiro, cartão..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Registrar pagamento
          </button>
        </div>
      </div>
    </div>
  )
}
