'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { 
  BookOpen, 
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Sparkles,
  Loader2,
  Play,
  Zap,
  Award,
  RefreshCcw
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

interface Statistics {
  totalQuizzes: number
  totalQuestions: number
  correctQuestions: number
  accuracyRate: number
  consecutiveDays: number
  completedQuizzes: number
  openQuizzes: number
  ineditedQuestions: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { showToast } = useToast()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Show success toast only once when component mounts
    const hasShownToast = sessionStorage.getItem('loginToastShown')
    if (!hasShownToast && isAuthenticated) {
      showToast('Login efetuado com sucesso!', 'success')
      sessionStorage.setItem('loginToastShown', 'true')
    }
  }, [showToast, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStatistics()
    }
  }, [isAuthenticated, user])

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true)
      const [statsResponse, historyResponse] = await Promise.all([
        apiClient.getStudentStatistics(),
        apiClient.getQuizHistory(1000, 0) // Get all quizzes
      ])
      
      const quizzes = historyResponse.data?.quizzes || []
      const openQuizzes = quizzes.filter((q: any) => !q.finishedAt)
      const completedQuizzes = quizzes.filter((q: any) => q.finishedAt)
      
      const totalQuestions = statsResponse.data?.overview?.total_questions || 0
      const averageScore = statsResponse.data?.overview?.average_score || 0
      const correctQuestions = Math.round(totalQuestions * (averageScore / 100))
      const consecutiveDays = statsResponse.data?.overview?.consecutive_days || 0
      const ineditedQuestions = statsResponse.data?.overview?.inedited_questions || 0
      
      setStatistics({
        totalQuizzes: quizzes.length,
        totalQuestions,
        correctQuestions,
        accuracyRate: averageScore,
        consecutiveDays,
        completedQuizzes: completedQuizzes.length,
        openQuizzes: openQuizzes.length,
        ineditedQuestions
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
      // Set default values on error
      setStatistics({
        totalQuizzes: 0,
        totalQuestions: 0,
        correctQuestions: 0,
        accuracyRate: 0,
        consecutiveDays: 0,
        completedQuizzes: 0,
        openQuizzes: 0,
        ineditedQuestions: 0
      })
    } finally {
      setLoadingStats(false)
    }
  }


  if (loadingStats) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name || 'Aluno'} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name || 'Aluno'} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Bem-vindo, {user?.name || 'Piloto'}!
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Continue sua jornada rumo à excelência na aviação
            </p>
            <button
              onClick={fetchStatistics}
              disabled={loadingStats}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
              Atualizar Estatísticas
            </button>
          </div>

          {/* Stats Cards - Same style as quizzes page */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Questões Respondidas</p>
                  <p className="text-3xl font-bold mt-1">{statistics?.totalQuestions || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Taxa de Acerto</p>
                  <p className="text-3xl font-bold mt-1">{typeof statistics?.accuracyRate === 'number' ? statistics.accuracyRate.toFixed(1) : '0.0'}%</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Quests Completos</p>
                  <p className="text-3xl font-bold mt-1">{statistics?.completedQuizzes || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Dias Consecutivos</p>
                  <p className="text-3xl font-bold mt-1">{statistics?.consecutiveDays || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-800">Comece Sua Preparação</h2>
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>

            <p className="text-center text-gray-600 text-lg mb-8">
              Elite Pilots - Sua plataforma completa de preparação para práticos de elite
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-600" />
                  Como Começar
                </h3>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p>Clique em <strong>&quot;GERAR QUEST&quot;</strong> para criar um novo simulado personalizado</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p>Escolha entre <strong>126 assuntos</strong> específicos ou selecione todos</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p>Aplique filtros inteligentes para focar no que mais precisa</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-red-600" />
                  Tipos de Quest
                </h3>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Quest Completo:</strong> Todas as questões disponíveis
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Quest Inédito:</strong> Apenas questões não respondidas
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Quest de Revisão:</strong> Questões que você errou
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>SuperQuest:</strong> 70 questões de todo o conteúdo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-red-600" />
                <h4 className="text-lg font-semibold text-gray-800">Dica do Dia</h4>
              </div>
              <p className="text-gray-700">
                Mantenha uma rotina diária de estudos! Responder questões todos os dias ajuda a fixar o conteúdo e identificar pontos de melhoria. 
                Você já está há <strong className="text-red-600">{statistics?.consecutiveDays || 0} dias</strong> mantendo sua sequência!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/quizzes/create" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                GERAR QUEST
                <Sparkles className="w-5 h-5" />
              </Link>
              
              <Link 
                href="/quizzes" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-red-600 font-semibold rounded-full border-2 border-red-600 hover:bg-red-50 transform hover:scale-105 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                VER MEUS QUESTS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}