'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  ListChecks,
  CheckCircle2,
  XCircle,
  BarChart3,
  Target,
  BookOpen,
  TrendingUp,
  Award,
  Activity,
  Zap,
  Brain,
  Trophy,
  Sparkles,
  ChartBar,
  Percent,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Statistics {
  overview: {
    total_quizzes: number
    total_questions: number
    average_score: number
  }
  subject_performance: Array<{
    subject_id: number
    subject_name: string
    subject_color: string
    quiz_count: number
    average_score: number
  }>
  recent_activity: Array<{
    date: string
    quiz_count: number
  }>
}

export default function StatisticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null)
  const [isAnimated, setIsAnimated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    fetchStatistics()
    
    // Trigger animations after component mount
    setTimeout(() => setIsAnimated(true), 100)
  }, [user, router])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getStudentStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      showToast('Erro ao carregar estatísticas', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        </div>
      </>
    )
  }

  if (!statistics) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Erro ao carregar estatísticas</p>
          </div>
        </div>
      </>
    )
  }

  const totalQuizzes = statistics.overview?.total_quizzes || 0
  const totalQuestions = statistics.overview?.total_questions || 0
  const averageScore = Number(statistics.overview?.average_score) || 0
  const accuracyRate = averageScore.toFixed(1)
  
  // Calculate derived statistics for display cards
  const correctAnswers = Math.round((averageScore / 100) * totalQuestions)
  const wrongAnswers = totalQuestions - correctAnswers

  const performanceBySubject = (statistics.subject_performance || [])
    .map(subject => ({
      name: subject.subject_name,
      percentage: subject.average_score || 0,
      correct: Math.round(((subject.average_score || 0) / 100) * (subject.quiz_count || 0) * 10), // Estimate based on average 10 questions per quiz
      total: (subject.quiz_count || 0) * 10, // Estimate based on average 10 questions per quiz
      color: (subject.average_score || 0) >= 80 
        ? 'from-green-400 to-green-600' 
        : (subject.average_score || 0) >= 60 
        ? 'from-yellow-400 to-yellow-600'
        : 'from-red-400 to-red-600'
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)

  return (
    <>
      <Navbar isAuthenticated={true} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <ChartBar className="w-10 h-10 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-800">Estatísticas de Desempenho</h1>
            </div>
          </div>

          {/* Performance Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-7 h-7 text-red-500" />
              Desempenho
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Questions Answered Card */}
              <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <Sparkles className="w-4 h-4 opacity-50" />
                </div>
                <div>
                  <p className="text-4xl font-bold mb-1">{totalQuizzes}</p>
                  <p className="text-blue-100 text-xs uppercase tracking-wider">Quizzes Completados</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{totalQuestions} perguntas respondidas</span>
                  </div>
                </div>
              </div>

              {/* Correct Answers Card */}
              <div className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }` } style={{ transitionDelay: '100ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <Trophy className="w-4 h-4 opacity-50" />
                </div>
                <div>
                  <p className="text-4xl font-bold mb-1">{correctAnswers}</p>
                  <p className="text-green-100 text-xs uppercase tracking-wider">Respostas Corretas</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <Award className="w-3 h-3" />
                    <span>Excelente desempenho!</span>
                  </div>
                </div>
              </div>

              {/* Wrong Answers Card */}
              <div className={`bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <Zap className="w-4 h-4 opacity-50" />
                </div>
                <div>
                  <p className="text-4xl font-bold mb-1">{wrongAnswers}</p>
                  <p className="text-red-100 text-xs uppercase tracking-wider">Respostas Erradas</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <Brain className="w-3 h-3" />
                    <span>Oportunidades de aprendizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Accuracy Rate Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-2">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Taxa de Acerto Geral</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-green-600">{accuracyRate}%</p>
                <Percent className="w-5 h-5 text-green-500" />
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: isAnimated ? `${accuracyRate}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Remaining Questions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-2">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Total de Questões</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
                <span className="text-gray-500 text-sm">perguntas totais</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: isAnimated ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Subject */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-red-500" />
              Aproveitamento por Assunto
            </h2>
            
            <div className="space-y-6">
              {performanceBySubject.map((subject, index) => (
                <div 
                  key={index}
                  className="group"
                  onMouseEnter={() => setHoveredSubject(index)}
                  onMouseLeave={() => setHoveredSubject(null)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      {subject.name}
                    </span>
                    <div className={`flex items-center gap-3 transition-all duration-300 ${
                      hoveredSubject === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <span className="text-sm text-gray-600">
                        {subject.correct}/{subject.total} questões
                      </span>
                      <span className="font-bold text-lg">
                        {subject.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-10 bg-gray-100 rounded-xl overflow-hidden group">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${subject.color} transition-all flex items-center justify-end pr-4`}
                      style={{ 
                        width: isAnimated ? `${subject.percentage}%` : '0%',
                        transitionDelay: `${index * 100}ms`,
                        transitionDuration: hoveredSubject === index ? '500ms' : '1000ms',
                        transform: hoveredSubject === index ? 'scaleY(1.1)' : 'scaleY(1)',
                        filter: hoveredSubject === index ? 'brightness(1.1)' : 'brightness(1)'
                      }}
                    >
                      <span className={`text-white font-bold transition-all duration-300 ${
                        hoveredSubject === index ? 'scale-125 drop-shadow-lg' : ''
                      }`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    {/* Animated shimmer effect on hover */}
                    <div 
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        hoveredSubject === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div 
                        className="h-full w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        style={{
                          animation: hoveredSubject === index ? 'shimmer 1s ease-out infinite' : 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                <span className="text-gray-600">Excelente (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                <span className="text-gray-600">Bom (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                <span className="text-gray-600">Precisa melhorar (&lt;60%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}