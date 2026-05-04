'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Loader2,
  Banknote,
  CreditCard
} from 'lucide-react'
import apiClient from '@/lib/api'

interface DashboardData {
  counts: {
    students: number
    questions: number
    quizzes: number
    subjects: number
  }
  recent_students: Array<{
    id: number
    name: string
    email: string
    created_at: string
  }>
  recent_quizzes: Array<{
    id: number
    score: number
    finished_at: string
    student: { name: string; email: string }
    subject: { name: string; color: string }
  }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.getAdminDashboard()
      .then((res: any) => setData(res.data))
      .catch((e: any) => setError(e?.message || 'Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle do EPilots</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total de Alunos"
          value={data.counts.students}
          icon={<GraduationCap className="w-12 h-12 text-blue-600" />}
        />
        <StatCard
          label="Total de Questões"
          value={data.counts.questions}
          icon={<FileQuestion className="w-12 h-12 text-green-600" />}
        />
        <StatCard
          label="Simulados Realizados"
          value={data.counts.quizzes}
          icon={<TrendingUp className="w-12 h-12 text-purple-600" />}
        />
        <StatCard
          label="Matérias"
          value={data.counts.subjects}
          icon={<BookOpen className="w-12 h-12 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Alunos Recentes</h2>
          {data.recent_students.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum aluno cadastrado ainda</p>
          ) : (
            <div className="space-y-3">
              {data.recent_students.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Simulados Recentes</h2>
          {data.recent_quizzes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum simulado finalizado ainda</p>
          ) : (
            <div className="space-y-3">
              {data.recent_quizzes.slice(0, 8).map(q => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{q.student?.name}</p>
                    <p className="text-xs text-gray-500">{q.subject?.name}</p>
                  </div>
                  <p className="font-semibold text-green-600">{q.score?.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <QuickAction href="/admin/students" icon={<GraduationCap className="w-8 h-8 text-blue-600" />} label="Alunos" />
          <QuickAction href="/admin/subscriptions" icon={<CreditCard className="w-8 h-8 text-green-600" />} label="Assinaturas" />
          <QuickAction href="/admin/payments" icon={<Banknote className="w-8 h-8 text-yellow-600" />} label="Pagamentos" />
          <QuickAction href="/admin/users" icon={<Users className="w-8 h-8 text-purple-600" />} label="Usuários" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value.toLocaleString('pt-BR')}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block text-center"
    >
      <div className="mx-auto mb-2 flex justify-center">{icon}</div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
    </Link>
  )
}
