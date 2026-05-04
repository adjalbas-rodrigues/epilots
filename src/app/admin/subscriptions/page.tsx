'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  X
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Student {
  id: number
  name: string
  email: string
  registration_number?: string
}

interface Subscription {
  id: number
  student_id: number
  plan: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'custom'
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  amount: number | null
  payment_method: string | null
  start_date: string
  end_date: string
  auto_renew: boolean
  notes: string | null
  created_at: string
  student?: Student
}

interface Stats {
  active: number
  expired: number
  cancelled: number
  expiringSoon: number
  totalStudents: number
  monthlyRevenue: number
}

const PLAN_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  custom: 'Personalizado'
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expirada', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadStats = useCallback(async () => {
    try {
      const res: any = await apiClient.getSubscriptionStats()
      setStats(res.data)
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e)
    }
  }, [])

  const loadSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getSubscriptions({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter,
        plan: planFilter
      })
      setSubscriptions(res.data?.subscriptions || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch (e) {
      console.error('Erro ao carregar assinaturas:', e)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, planFilter])

  const loadStudents = useCallback(async (q?: string) => {
    try {
      const res: any = await apiClient.getStudents(1, 50, q)
      setStudents(res.data?.students || [])
    } catch (e) {
      console.error('Erro ao buscar alunos:', e)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadSubscriptions() }, [loadSubscriptions])

  useEffect(() => {
    if (showModal) loadStudents(studentSearch)
  }, [showModal, studentSearch, loadStudents])

  const handleOpenCreate = () => {
    setEditing(null)
    setStudentSearch('')
    setShowModal(true)
  }

  const handleOpenEdit = (sub: Subscription) => {
    setEditing(sub)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleRenew = async (sub: Subscription) => {
    if (!confirm(`Renovar assinatura ${PLAN_LABELS[sub.plan]} de ${sub.student?.name}?`)) return
    try {
      await apiClient.renewSubscription(sub.id)
      await Promise.all([loadSubscriptions(), loadStats()])
    } catch (e: any) {
      alert(e?.message || 'Erro ao renovar')
    }
  }

  const handleCancel = async (sub: Subscription) => {
    if (!confirm(`Cancelar assinatura de ${sub.student?.name}? O acesso será bloqueado.`)) return
    try {
      await apiClient.cancelSubscription(sub.id)
      await Promise.all([loadSubscriptions(), loadStats()])
    } catch (e: any) {
      alert(e?.message || 'Erro ao cancelar')
    }
  }

  const handleDelete = async (sub: Subscription) => {
    if (!confirm('Excluir registro permanentemente? Essa ação não pode ser desfeita.')) return
    try {
      await apiClient.deleteSubscription(sub.id)
      await Promise.all([loadSubscriptions(), loadStats()])
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
  const formatMoney = (n: number | null) =>
    n != null ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'

  const daysUntil = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Assinaturas</h1>
            <p className="text-gray-600 mt-2">Gerencie as assinaturas mensais dos alunos</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Assinatura
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ativas"
          value={stats?.active ?? 0}
          icon={<CheckCircle2 className="w-10 h-10 text-green-600" />}
        />
        <StatCard
          label="Vencendo em 7 dias"
          value={stats?.expiringSoon ?? 0}
          icon={<AlertTriangle className="w-10 h-10 text-yellow-500" />}
        />
        <StatCard
          label="Expiradas"
          value={stats?.expired ?? 0}
          icon={<XCircle className="w-10 h-10 text-red-500" />}
        />
        <StatCard
          label="Receita mensal estimada"
          value={(stats?.monthlyRevenue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign className="w-10 h-10 text-blue-600" />}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por aluno (nome, email, matrícula)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="expired">Expiradas</option>
            <option value="cancelled">Canceladas</option>
            <option value="pending">Pendentes</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os planos</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma assinatura encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Aluno</th>
                  <th className="px-6 py-3 text-left">Plano</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Valor</th>
                  <th className="px-6 py-3 text-left">Período</th>
                  <th className="px-6 py-3 text-left">Vencimento</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => {
                  const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending
                  const days = daysUntil(sub.end_date)
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{sub.student?.name || `Aluno #${sub.student_id}`}</div>
                        <div className="text-xs text-gray-500">{sub.student?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{PLAN_LABELS[sub.plan]}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatMoney(Number(sub.amount))}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(sub.start_date)} → {formatDate(sub.end_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {sub.status === 'active' && days >= 0 && (
                          <span className={days <= 7 ? 'text-yellow-600 font-medium' : 'text-gray-700'}>
                            {days === 0 ? 'Vence hoje' : `em ${days} dia${days > 1 ? 's' : ''}`}
                          </span>
                        )}
                        {sub.status === 'expired' && (
                          <span className="text-red-600 font-medium">{Math.abs(days)} dia(s) atrás</span>
                        )}
                        {(sub.status === 'cancelled' || sub.status === 'pending') && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRenew(sub)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Renovar"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleCancel(sub)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(sub)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Próximo
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <SubscriptionFormModal
          editing={editing}
          students={students}
          studentSearch={studentSearch}
          onSearchStudents={(q) => { setStudentSearch(q); loadStudents(q) }}
          onClose={handleClose}
          onSaved={async () => {
            handleClose()
            await Promise.all([loadSubscriptions(), loadStats()])
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

interface FormModalProps {
  editing: Subscription | null
  students: Student[]
  studentSearch: string
  onSearchStudents: (q: string) => void
  onClose: () => void
  onSaved: () => Promise<void>
}

function SubscriptionFormModal({ editing, students, studentSearch, onSearchStudents, onClose, onSaved }: FormModalProps) {
  const [studentId, setStudentId] = useState<number | null>(editing?.student_id ?? null)
  const [plan, setPlan] = useState(editing?.plan || 'mensal')
  const [status, setStatus] = useState(editing?.status || 'active')
  const [amount, setAmount] = useState<string>(editing?.amount != null ? String(editing.amount) : '')
  const [paymentMethod, setPaymentMethod] = useState(editing?.payment_method || '')
  const [startDate, setStartDate] = useState(editing?.start_date || new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(editing?.end_date || '')
  const [autoRenew, setAutoRenew] = useState(editing?.auto_renew || false)
  const [notes, setNotes] = useState(editing?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!editing && !studentId) {
      alert('Selecione um aluno')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        plan,
        status,
        amount: amount ? parseFloat(amount) : null,
        payment_method: paymentMethod || null,
        start_date: startDate,
        end_date: endDate || undefined,
        auto_renew: autoRenew,
        notes: notes || null
      }
      if (editing) {
        await apiClient.updateSubscription(editing.id, payload)
      } else {
        await apiClient.createSubscription({ ...payload, student_id: studentId! })
      }
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editing ? 'Editar Assinatura' : 'Nova Assinatura'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <input
                type="text"
                placeholder="Buscar aluno por nome ou email..."
                value={studentSearch}
                onChange={(e) => onSearchStudents(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {students.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStudentId(s.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${studentId === s.id ? 'bg-blue-100' : ''}`}
                  >
                    <div className="text-sm font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </button>
                ))}
                {students.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">Nenhum aluno encontrado</div>
                )}
              </div>
            </div>
          )}

          {editing && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">{editing.student?.name}</div>
              <div className="text-xs text-gray-500">{editing.student?.email}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="mensal">Mensal (30 dias)</option>
                <option value="trimestral">Trimestral (90 dias)</option>
                <option value="semestral">Semestral (180 dias)</option>
                <option value="anual">Anual (365 dias)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="active">Ativa</option>
                  <option value="expired">Expirada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="99.90"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="PIX, Cartão, Boleto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim {plan !== 'custom' && <span className="text-gray-400">(automático)</span>}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={plan !== 'custom' && !editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Renovar automaticamente</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Observações internas..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Salvar' : 'Criar Assinatura'}
          </button>
        </div>
      </div>
    </div>
  )
}
