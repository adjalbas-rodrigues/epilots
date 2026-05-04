'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar
} from 'lucide-react'
import apiClient from '@/lib/api'

interface ActiveSubscription {
  id: number
  plan: string
  status: string
  end_date: string
  amount: number | null
}

interface Student {
  id: number
  name: string
  email: string
  registration_number?: string
  created_at: string
  is_active: boolean
  active_subscription: ActiveSubscription | null
  subscription_status: 'active' | 'inactive'
}

const PLAN_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  custom: 'Personalizado'
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [granting, setGranting] = useState<number | null>(null)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getStudents(page, 20, search || undefined)
      setStudents(res.data?.students || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch (e) {
      console.error('Erro ao carregar alunos:', e)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadStudents() }, [loadStudents])

  const filteredStudents = students.filter(s => {
    if (statusFilter === 'all') return true
    return s.subscription_status === statusFilter
  })

  const handleQuickGrant = async (student: Student) => {
    if (!confirm(`Conceder 30 dias de assinatura mensal para ${student.name}?`)) return
    setGranting(student.id)
    try {
      await apiClient.createSubscription({
        student_id: student.id,
        plan: 'mensal'
      })
      await loadStudents()
    } catch (e: any) {
      alert(e?.message || 'Erro ao conceder assinatura')
    } finally {
      setGranting(null)
    }
  }

  const handleDelete = async (student: Student) => {
    if (!confirm(`Excluir o aluno ${student.name}? Essa ação não pode ser desfeita.`)) return
    try {
      await apiClient.deleteStudent(student.id)
      await loadStudents()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir aluno')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const daysUntil = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Alunos</h1>
            <p className="text-gray-600 mt-2">Gerencie os alunos e suas assinaturas</p>
          </div>
          <Link
            href="/admin/students/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Aluno
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou matrícula..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Com assinatura ativa</option>
            <option value="inactive">Sem assinatura</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum aluno encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Aluno</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Assinatura</th>
                  <th className="px-6 py-3 text-left">Cadastro</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => {
                  const sub = student.active_subscription
                  const days = sub ? daysUntil(sub.end_date) : null
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        {student.registration_number && (
                          <div className="text-xs text-gray-500">Matrícula: {student.registration_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                      <td className="px-6 py-4">
                        {sub ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3" />
                              {PLAN_LABELS[sub.plan]}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span className={days !== null && days <= 7 ? 'text-yellow-600 font-medium' : ''}>
                                Vence em {formatDate(sub.end_date)}
                                {days !== null && days >= 0 && ` (${days}d)`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                            <XCircle className="w-3 h-3" />
                            Sem assinatura
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(student.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!sub && (
                            <button
                              onClick={() => handleQuickGrant(student)}
                              disabled={granting === student.id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Conceder 30 dias mensais"
                            >
                              {granting === student.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CreditCard className="w-4 h-4" />
                              }
                            </button>
                          )}
                          <Link
                            href={`/admin/subscriptions?student=${student.id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Gerenciar assinatura"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(student)}
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
    </div>
  )
}
