'use client'

import { useState } from 'react'
import { 
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  FileQuestion,
  Calendar,
  Filter,
  Download,
  Percent
} from 'lucide-react'

export default function AdminStatisticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Mock data for statistics
  const generalStats = {
    totalStudents: 156,
    activeStudents: 89,
    totalQuizzes: 1234,
    averageScore: 76.5,
    questionsAnswered: 45678,
    correctAnswers: 34923,
  }

  const performanceBySubject = [
    { name: 'Navegação', students: 145, avgScore: 82.3, totalQuestions: 234 },
    { name: 'Meteorologia', students: 132, avgScore: 78.9, totalQuestions: 189 },
    { name: 'Regulamentos de Tráfego Marítimo', students: 156, avgScore: 75.2, totalQuestions: 312 },
    { name: 'Conhecimentos de Embarcação', students: 98, avgScore: 71.8, totalQuestions: 156 },
    { name: 'Comunicações', students: 87, avgScore: 69.5, totalQuestions: 145 },
  ]

  const dailyActivity = [
    { date: '14/01', quizzes: 45, students: 32 },
    { date: '15/01', quizzes: 52, students: 38 },
    { date: '16/01', quizzes: 38, students: 28 },
    { date: '17/01', quizzes: 61, students: 45 },
    { date: '18/01', quizzes: 73, students: 52 },
    { date: '19/01', quizzes: 89, students: 61 },
    { date: '20/01', quizzes: 67, students: 48 },
  ]

  const topStudents = [
    { name: 'Pedro Oliveira', quizzes: 45, avgScore: 94.2, trend: 'up' },
    { name: 'Ana Costa', quizzes: 38, avgScore: 91.8, trend: 'up' },
    { name: 'João Silva', quizzes: 52, avgScore: 88.5, trend: 'down' },
    { name: 'Maria Santos', quizzes: 41, avgScore: 86.9, trend: 'stable' },
    { name: 'Carlos Mendes', quizzes: 29, avgScore: 85.3, trend: 'up' },
  ]

  const quizTypes = [
    { type: 'Aleatórias', count: 432, percentage: 35 },
    { type: 'Inéditas', count: 285, percentage: 23 },
    { type: 'Erradas', count: 198, percentage: 16 },
    { type: 'Super Quest', count: 161, percentage: 13 },
    { type: 'Favoritas', count: 98, percentage: 8 },
    { type: 'Numéricas', count: 60, percentage: 5 },
  ]

  const maxDailyQuizzes = Math.max(...dailyActivity.map(d => d.quizzes))

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Estatísticas do Sistema</h1>
            <p className="text-gray-600 mt-2">Análise detalhada do desempenho e uso da plataforma</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Exportar Relatório
          </button>
        </div>
      </header>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Hoje</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{generalStats.totalStudents}</p>
          <p className="text-sm text-gray-600">Alunos Total</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{generalStats.activeStudents}</p>
          <p className="text-sm text-gray-600">Alunos Ativos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <FileQuestion className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-green-600 font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{generalStats.totalQuizzes}</p>
          <p className="text-sm text-gray-600">Simulados</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-8 h-8 text-orange-600" />
            <span className="text-xs text-red-600 font-medium">-2%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{generalStats.averageScore}%</p>
          <p className="text-sm text-gray-600">Média Geral</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <span className="text-xs text-green-600 font-medium">+22%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{generalStats.questionsAnswered}</p>
          <p className="text-sm text-gray-600">Questões</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-pink-600" />
            <span className="text-xs text-green-600 font-medium">+3%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {((generalStats.correctAnswers / generalStats.questionsAnswered) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Taxa Acerto</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Atividade Diária</h2>
          <div className="space-y-4">
            {dailyActivity.map((day) => (
              <div key={day.date} className="flex items-center">
                <span className="w-16 text-sm text-gray-600">{day.date}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-8 relative">
                    <div
                      className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(day.quizzes / maxDailyQuizzes) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{day.quizzes}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-20 text-right">{day.students} alunos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Types Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Tipos de Simulados</h2>
          <div className="space-y-4">
            {quizTypes.map((type, index) => (
              <div key={type.type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                  <span className="text-sm text-gray-600">{type.count} ({type.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' :
                      index === 1 ? 'bg-green-600' :
                      index === 2 ? 'bg-red-600' :
                      index === 3 ? 'bg-purple-600' :
                      index === 4 ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance by Subject */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Desempenho por Matéria</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-700">Matéria</th>
                <th className="text-center py-3 px-4 text-gray-700">Alunos</th>
                <th className="text-center py-3 px-4 text-gray-700">Média</th>
                <th className="text-center py-3 px-4 text-gray-700">Questões</th>
                <th className="text-right py-3 px-4 text-gray-700">Desempenho</th>
              </tr>
            </thead>
            <tbody>
              {performanceBySubject.map((subject) => (
                <tr key={subject.name} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{subject.name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.students}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${
                      subject.avgScore >= 80 ? 'text-green-600' :
                      subject.avgScore >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.totalQuestions}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          subject.avgScore >= 80 ? 'bg-green-600' :
                          subject.avgScore >= 70 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${subject.avgScore}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Top 5 Alunos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-700">Posição</th>
                <th className="text-left py-3 px-4 text-gray-700">Aluno</th>
                <th className="text-center py-3 px-4 text-gray-700">Simulados</th>
                <th className="text-center py-3 px-4 text-gray-700">Média</th>
                <th className="text-center py-3 px-4 text-gray-700">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((student, index) => (
                <tr key={student.name} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{student.quizzes}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-green-600">{student.avgScore}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {student.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />}
                    {student.trend === 'down' && <TrendingUp className="w-5 h-5 text-red-600 mx-auto transform rotate-180" />}
                    {student.trend === 'stable' && <div className="w-5 h-0.5 bg-gray-400 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}