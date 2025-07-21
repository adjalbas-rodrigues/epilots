'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Home,
  RefreshCw,
  Mail,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flag
} from 'lucide-react'

interface Choice {
  id: number
  description: string
  label: string
  is_correct: boolean
}

interface Question {
  id: number
  statement: string
  selected_choice: Choice | null
  correct_choice: Choice
  marked: boolean
  choices: Choice[]
}

interface QuizFeedback {
  quiz: {
    id: number
    studentId: number
    subjectId: number
    startedAt: string
    finishedAt: string
    score: number
    total_questions: number
    correct_answers: number
    subject: {
      id: number
      name: string
      color: string | null
    }
  }
  questions: Question[]
  topics_performance: Array<{
    topic_id: number
    topic_name: string
    total: number
    correct: number
    percentage: number
  }>
}

export default function QuizFeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = Number(params.id)
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchQuizFeedback()
  }, [user, router, quizId])

  const fetchQuizFeedback = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getQuizFeedback(quizId)
      setFeedback(response.data)
    } catch (error) {
      console.error('Error fetching quiz feedback:', error)
      showToast('Erro ao carregar resultado do quiz', 'error')
      router.push('/quizzes')
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestionExpanded = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando resultado...</p>
          </div>
        </div>
      </>
    )
  }

  if (!feedback) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Resultado não encontrado</p>
          </div>
        </div>
      </>
    )
  }

  const { quiz, questions, topics_performance } = feedback
  const percentage = (quiz.correct_answers / quiz.total_questions) * 100
  const duration = new Date(quiz.finishedAt).getTime() - new Date(quiz.startedAt).getTime()
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Excelente! Você domina o conteúdo!'
    if (percentage >= 80) return 'Muito bom! Continue assim!'
    if (percentage >= 70) return 'Bom trabalho! Há espaço para melhorar.'
    if (percentage >= 60) return 'Regular. Reforce seus estudos.'
    return 'Precisa melhorar. Não desista!'
  }

  const getPerformanceColor = () => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
              <div className="text-center mb-8">
                <div className="mb-6">
                  <Trophy className={`w-24 h-24 mx-auto ${percentage >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Quiz Concluído!
                </h1>
                <p className={`text-xl ${getPerformanceColor()}`}>
                  {getPerformanceMessage()}
                </p>
              </div>

              {/* Subject Badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <span 
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: quiz.subject.color ? `${quiz.subject.color}20` : '#f3f4f6',
                    color: quiz.subject.color || '#4b5563'
                  }}
                >
                  {quiz.subject.name}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-800">{percentage.toFixed(0)}%</p>
                  <p className="text-gray-600 mt-1">Taxa de Acerto</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-800">{quiz.correct_answers}/{quiz.total_questions}</p>
                  <p className="text-gray-600 mt-1">Questões Corretas</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-800">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                  <p className="text-gray-600 mt-1">Tempo Total</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Desempenho</span>
                  <span>{quiz.correct_answers} acertos de {quiz.total_questions} questões</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/quizzes" 
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Voltar aos Quizzes
                </Link>
                
                <Link 
                  href="/quizzes/create" 
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Novo Quiz
                </Link>
                
                <Link 
                  href="/statistics" 
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  Ver Estatísticas
                </Link>
              </div>
            </div>

            {/* Topic Performance */}
            {topics_performance && topics_performance.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Desempenho por Tópico</h2>
                
                <div className="space-y-4">
                  {topics_performance.map((topic) => (
                    <div key={topic.topic_id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{topic.topic_name}</span>
                          <span className="text-sm text-gray-500">
                            {topic.correct}/{topic.total} questões
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              topic.percentage >= 80 ? 'bg-green-500' :
                              topic.percentage >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${topic.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          topic.percentage >= 80 ? 'text-green-600' :
                          topic.percentage >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {topic.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Revisão das Questões</h2>
              
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const isExpanded = expandedQuestions.has(question.id)
                  const isCorrect = question.selected_choice?.is_correct || false
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`border-2 rounded-xl transition-all ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <button
                        onClick={() => toggleQuestionExpanded(question.id)}
                        className="w-full p-4 text-left focus:outline-none"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isCorrect ? 'bg-green-200' : 'bg-red-200'
                            }`}>
                              {isCorrect ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-600" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  Questão {index + 1}
                                </h3>
                                {question.marked && (
                                  <Flag className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-gray-700 line-clamp-2">
                                {question.statement}
                              </p>
                              <p className={`text-sm mt-2 font-medium ${
                                isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="ml-14 space-y-3">
                            {question.choices.map((choice) => {
                              const isSelected = question.selected_choice?.id === choice.id
                              const isCorrectChoice = choice.is_correct
                              
                              return (
                                <div 
                                  key={choice.id}
                                  className={`p-3 rounded-lg border ${
                                    isCorrectChoice
                                      ? 'border-green-400 bg-green-100'
                                      : isSelected
                                      ? 'border-red-400 bg-red-100'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isCorrectChoice
                                        ? 'bg-green-500 text-white'
                                        : isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {choice.label}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-gray-700">{choice.description}</p>
                                      {isCorrectChoice && (
                                        <p className="text-sm text-green-600 mt-1 font-medium">
                                          Resposta correta
                                        </p>
                                      )}
                                      {isSelected && !isCorrectChoice && (
                                        <p className="text-sm text-red-600 mt-1 font-medium">
                                          Sua resposta
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}