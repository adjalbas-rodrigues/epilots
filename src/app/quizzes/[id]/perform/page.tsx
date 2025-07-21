'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  ChevronRight,
  ChevronLeft,
  Star,
  Flag,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Target,
  Loader2,
  Hash
} from 'lucide-react'

interface Choice {
  id: number
  description: string
  label: string
}

interface Question {
  id: number
  statement: string
  quiz_question_id: number
  selected_choice_id: number | null
  marked: boolean
  choices: Choice[]
}

interface QuizData {
  quiz: {
    id: number
    studentId: number
    subjectId: number
    startedAt: string
    finishedAt: string | null
    subject: {
      id: number
      name: string
      color: string | null
    }
  }
  questions: Question[]
}

export default function QuizPerformPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = Number(params.id)
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchQuiz()

    // Start timer
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [user, router, quizId, startTime])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getQuiz(quizId)
      setQuizData(response.data)
      
      // Find first unanswered question
      const firstUnanswered = response.data.questions.findIndex(
        (q: Question) => !q.selected_choice_id
      )
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered)
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      showToast('Erro ao carregar quiz', 'error')
      router.push('/quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (choiceId: number) => {
    setSelectedAnswer(choiceId)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !quizData) return

    const currentQuestion = quizData.questions[currentQuestionIndex]
    
    try {
      setSubmitting(true)
      await apiClient.submitAnswer(quizId, currentQuestion.id, selectedAnswer)
      
      // Update local state
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        selected_choice_id: selectedAnswer
      }
      setQuizData({ ...quizData, questions: updatedQuestions })
      
      // Move to next question if not last
      if (currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
      } else {
        // All questions answered, prompt to finish
        showToast('Todas as questões foram respondidas!', 'success')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      showToast('Erro ao salvar resposta', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkQuestion = async () => {
    if (!quizData) return

    const currentQuestion = quizData.questions[currentQuestionIndex]
    const newMarkedStatus = !currentQuestion.marked

    try {
      await apiClient.markQuestion(quizId, currentQuestion.id, newMarkedStatus)
      
      // Update local state
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        marked: newMarkedStatus
      }
      setQuizData({ ...quizData, questions: updatedQuestions })
      
      showToast(
        newMarkedStatus ? 'Questão marcada para revisão' : 'Marcação removida',
        'success'
      )
    } catch (error) {
      console.error('Error marking question:', error)
      showToast('Erro ao marcar questão', 'error')
    }
  }

  const handleFinishQuiz = async () => {
    try {
      setSubmitting(true)
      const response = await apiClient.finishQuiz(quizId)
      showToast(`Quiz finalizado! Acertos: ${response.data.correct}/${response.data.total}`, 'success')
      router.push(`/quizzes/${quizId}/feedback`)
    } catch (error) {
      console.error('Error finishing quiz:', error)
      showToast('Erro ao finalizar quiz', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando quiz...</p>
          </div>
        </div>
      </>
    )
  }

  if (!quizData) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Quiz não encontrado</p>
          </div>
        </div>
      </>
    )
  }

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const answeredQuestions = quizData.questions.filter(q => q.selected_choice_id !== null).length
  const progress = (answeredQuestions / quizData.questions.length) * 100

  return (
    <>
      <Navbar isAuthenticated={true} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Progress Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">
                  Questão {currentQuestionIndex + 1} de {quizData.questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {answeredQuestions} respondidas
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
                <button
                  onClick={handleMarkQuestion}
                  className={`p-2 rounded-lg transition-all ${
                    currentQuestion.marked
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Marcar para revisão"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {/* Subject Badge */}
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: quizData.quiz.subject.color ? `${quizData.quiz.subject.color}20` : '#f3f4f6',
                  color: quizData.quiz.subject.color || '#4b5563'
                }}
              >
                {quizData.quiz.subject.name}
              </span>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Questão {currentQuestionIndex + 1}
              </h2>
              <div 
                className="prose-quiz"
                dangerouslySetInnerHTML={{ __html: currentQuestion.statement }}
              />
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleAnswerSelect(choice.id)}
                  disabled={submitting}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnswer === choice.id
                      ? 'border-red-500 bg-red-50'
                      : currentQuestion.selected_choice_id === choice.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${submitting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedAnswer === choice.id
                        ? 'bg-red-500 text-white'
                        : currentQuestion.selected_choice_id === choice.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {choice.label}
                    </span>
                    <div 
                      className="prose-quiz flex-1"
                      dangerouslySetInnerHTML={{ __html: choice.description }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(quizData.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === quizData.questions.length - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                {currentQuestion.selected_choice_id === null && selectedAnswer && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Confirmar Resposta
                  </button>
                )}
                
                {answeredQuestions === quizData.questions.length && (
                  <button
                    onClick={handleFinishQuiz}
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Finalizar Quiz
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Navegador de Questões
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {quizData.questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-red-500 text-white'
                      : question.selected_choice_id !== null
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${question.marked ? 'ring-2 ring-yellow-400' : ''}`}
                  title={`Questão ${index + 1}${question.marked ? ' (Marcada)' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Não respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded ring-2 ring-yellow-400"></div>
                <span>Marcada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}