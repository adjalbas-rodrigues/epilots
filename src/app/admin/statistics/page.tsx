'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3, TrendingUp, Users, FileQuestion, BookOpen, Loader2
} from 'lucide-react'
import apiClient from '@/lib/api'

interface DashboardData {
  counts: {
    students: number
    questions: number
    quizzes: number
    subjects: number
  }
  recent_quizzes: Array<{
    id: number
    score: number
    finished_at: string
    student: { name: string; email: string }
    subject: { name: string; color: string }
  }>
}

export default function AdminStatisticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getAdminDashboard()
      .then((res: any) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-gray-500">Sem dados disponíveis</div>
  }

  // Aggregate score data from recent quizzes
  const totalQuizzes = data.recent_quizzes.length
  const avgScore = totalQuizzes > 0
    ? data.recent_quizzes.reduce((acc, q) => acc + (q.score || 0), 0) / totalQuizzes
    : 0

  const subjectStats: Record<string, { count: number; sum: number; color: string }> = {}
  data.recent_quizzes.forEach(q => {
    const name = q.subject?.name || 'Sem matéria'
    if (!subjectStats[name]) {
      subjectStats[name] = { count: 0, sum: 0, color: q.subject?.color || '#3b82f6' }
    }
    subjectStats[name].count += 1
    subjectStats[name].sum += q.score || 0
  })

  const subjectData = Object.entries(subjectStats)
    .map(([name, s]) => ({
      name,
      count: s.count,
      avg: s.sum / s.count,
      color: s.color
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Estatísticas</h1>
        <p className="text-gray-600 mt-2">Visão geral do desempenho da plataforma</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card label="Alunos" value={data.counts.students} icon={<Users className="w-10 h-10 text-blue-600" />} />
        <Card label="Questões" value={data.counts.questions} icon={<FileQuestion className="w-10 h-10 text-green-600" />} />
        <Card label="Simulados" value={data.counts.quizzes} icon={<BarChart3 className="w-10 h-10 text-purple-600" />} />
        <Card label="Matérias" value={data.counts.subjects} icon={<BookOpen className="w-10 h-10 text-orange-600" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Desempenho por matéria
          </h2>
          {subjectData.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem dados de simulados ainda</p>
          ) : (
            <div className="space-y-3">
              {subjectData.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    <span className="text-sm text-gray-500">{s.avg.toFixed(1)}% • {s.count} quiz</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, s.avg)}%`,
                        backgroundColor: s.color
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo Geral</h2>
          <div className="space-y-4">
            <Stat label="Média de pontuação (últimos quizzes)" value={`${avgScore.toFixed(1)}%`} />
            <Stat label="Quizzes finalizados" value={String(totalQuizzes)} />
            <Stat label="Total de alunos cadastrados" value={data.counts.students.toLocaleString('pt-BR')} />
            <Stat label="Total de questões no banco" value={data.counts.questions.toLocaleString('pt-BR')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value.toLocaleString('pt-BR')}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  )
}
