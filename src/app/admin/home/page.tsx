'use client'

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileQuestion,
  TrendingUp,
  Activity,
  Target,
  Clock
} from 'lucide-react'

export default function AdminDashboard() {
  // Mock statistics
  const stats = {
    totalStudents: 156,
    activeStudents: 89,
    totalQuestions: 1234,
    totalSubjects: 12,
    todayQuizzes: 45,
    weeklyGrowth: 12.5,
    averageScore: 76.3,
    totalQuizzes: 523,
  }

  const recentActivities = [
    { id: 1, student: 'João Silva', action: 'Completou simulado', time: '5 minutos atrás', score: 85 },
    { id: 2, student: 'Maria Santos', action: 'Iniciou simulado', time: '10 minutos atrás', score: null },
    { id: 3, student: 'Pedro Oliveira', action: 'Completou simulado', time: '15 minutos atrás', score: 92 },
    { id: 4, student: 'Ana Costa', action: 'Completou simulado', time: '30 minutos atrás', score: 78 },
    { id: 5, student: 'Carlos Mendes', action: 'Iniciou simulado', time: '1 hora atrás', score: null },
  ]

  const topPerformers = [
    { id: 1, name: 'Pedro Oliveira', average: 94.5, quizzes: 23 },
    { id: 2, name: 'Ana Costa', average: 91.2, quizzes: 19 },
    { id: 3, name: 'João Silva', average: 88.7, quizzes: 31 },
    { id: 4, name: 'Maria Santos', average: 86.3, quizzes: 27 },
    { id: 5, name: 'Carlos Mendes', average: 84.9, quizzes: 15 },
  ]

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle do EPilots</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeStudents} ativos hoje
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Questões</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalQuestions}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalSubjects} matérias
              </p>
            </div>
            <FileQuestion className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Simulados Hoje</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.todayQuizzes}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.weeklyGrowth}% esta semana
              </p>
            </div>
            <Activity className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.averageScore}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalQuizzes} simulados
              </p>
            </div>
            <Target className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.student}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score && (
                    <p className="font-semibold text-green-600">{activity.score}%</p>
                  )}
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Melhores Desempenhos</h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{performer.name}</p>
                    <p className="text-sm text-gray-600">{performer.quizzes} simulados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{performer.average}%</p>
                  <p className="text-sm text-gray-500">média</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Adicionar Usuário</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Adicionar Aluno</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileQuestion className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nova Questão</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nova Matéria</p>
          </button>
        </div>
      </div>
    </div>
  )
}