'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  Plus,
  Calendar,
  Trophy,
  Target,
  Clock,
  Play,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
  RefreshCw,
  BookOpen,
  Loader2
} from 'lucide-react'

interface Quiz {
  id: number
  studentId: number
  subjectId: number
  name?: string | null
  startedAt: string
  finishedAt: string | null
  subject: {
    id: number
    name: string
    color: string | null
  }
}

interface QuizHistory {
  quizzes: Quiz[]
  total: number
  limit: number
  offset: number
}

export default function QuizzesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [quizHistory, setQuizHistory] = useState<QuizHistory | null>(null)
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else {
      fetchQuizHistory()
      fetchStatistics()
    }
  }, [user, router])

  const fetchQuizHistory = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getQuizHistory(50, 0)
      setQuizHistory(response.data)
    } catch (error) {
      console.error('Error fetching quiz history:', error)
      showToast('Erro ao carregar histórico de quizzes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.getStudentStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Tem certeza que deseja excluir este quest?')) {
      return
    }

    try {
      await apiClient.deleteQuiz(quizId)
      showToast('Quest excluído com sucesso!', 'success')
      fetchQuizHistory() // Refresh the list
    } catch (error) {
      console.error('Error deleting quiz:', error)
      showToast('Erro ao excluir quest', 'error')
    }
  }

  // Separate quizzes into open and completed
  const openQuizzes = quizHistory?.quizzes.filter(quiz => !quiz.finishedAt) || []
  const completedQuizzes = quizHistory?.quizzes.filter(quiz => quiz.finishedAt) || []

  const displayQuizzes = activeTab === 'open' ? openQuizzes : completedQuizzes

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando quizzes...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800">Meus Quests</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Quests Abertos</p>
                <p className="text-3xl font-bold mt-1">{openQuizzes.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Play className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Quests Concluídos</p>
                <p className="text-3xl font-bold mt-1">{completedQuizzes.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Taxa de Acerto</p>
                <p className="text-3xl font-bold mt-1">
                  {typeof statistics?.overview?.average_score === 'number' ? statistics.overview.average_score.toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Questões Inéditas</p>
                <p className="text-3xl font-bold mt-1">
                  {statistics?.overview?.inedited_questions || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-gray-800">Criação de Quest</h3>
            <Link href="/quizzes/create" className="btn-epilots btn-epilots-primary">
              <Plus className="w-5 h-5" />
              GERAR QUEST
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
            >
              <option value="all">Todos os tipos</option>
              <option value="inedited">Inéditas</option>
              <option value="wrong">Erradas</option>
              <option value="favorites">Favoritas</option>
              <option value="subject">Por Assunto</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="date">Mais recentes</option>
              <option value="performance">Melhor desempenho</option>
              <option value="name">Nome</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'open'
                    ? 'text-red-600 border-b-3 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quests abertos ({openQuizzes.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'text-red-600 border-b-3 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quests concluídos ({completedQuizzes.length})
              </button>
            </div>
          </div>

          {/* Quiz List */}
          <div className="p-6">
            <div className="space-y-4">
              {displayQuizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-red-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="text-lg font-bold text-gray-800">
                          {quiz.name || `Quiz #${quiz.id}`} - {quiz.subject.name}
                        </h4>
                        {quiz.subject.color && (
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: quiz.subject.color + '20',
                              color: quiz.subject.color,
                              border: `1px solid ${quiz.subject.color}40`
                            }}
                          >
                            {quiz.subject.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(quiz.startedAt).date} às {formatDate(quiz.startedAt).time}
                        </span>
                        
                        {quiz.finishedAt && (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duração: {calculateDuration(quiz.startedAt, quiz.finishedAt)}
                          </span>
                        )}

                        {!quiz.finishedAt && (
                          <span className="flex items-center gap-2 text-orange-600">
                            <RefreshCw className="w-4 h-4" />
                            Em andamento
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      {activeTab === 'open' ? (
                        <>
                          <Link 
                            href={`/quizzes/${quiz.id}/perform`}
                            className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Play className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <Link 
                          href={`/quizzes/${quiz.id}/feedback`}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Revisar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayQuizzes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {activeTab === 'open' 
                    ? 'Você não tem nenhum quest aberto no momento.' 
                    : 'Você ainda não concluiu nenhum quest.'}
                </p>
                {activeTab === 'open' && (
                  <Link href="/quizzes/create" className="btn-epilots btn-epilots-primary">
                    <Plus className="w-5 h-5" />
                    CRIAR NOVO QUEST
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}