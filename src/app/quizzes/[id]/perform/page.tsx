'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import VdoCipherPlayerFinal from '@/components/VdoCipherPlayerFinal'
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
  Hash,
  PlayCircle,
  Keyboard,
  Info
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
  topic?: {
    id: number
    name: string
  }
  feedback?: {
    isCorrect: boolean
    correctChoiceId: number | null
    correctAnswer: string | null
    explanation: string
    video?: {
      id: number
      name: string
      description: string
      videoId: string
      thumbnail?: string
      duration: number
      teacherName: string
    } | null
  }
}

interface QuizData {
  quiz: {
    id: number
    studentId: number
    subjectId: number
    name?: string | null
    feedbackMode?: 'immediate' | 'end'
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
  const [feedbacks, setFeedbacks] = useState<{ [questionId: number]: any }>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(true)

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
      
      // If immediate mode, feedback is already included in questions from backend
      if (response.data.quiz.feedbackMode === 'immediate') {
        const feedbackData: { [key: number]: any } = {}
        
        // Extract feedback from questions that already have it
        for (const question of response.data.questions) {
          if (question.feedback) {
            feedbackData[question.id] = question.feedback
          }
        }
        
        setFeedbacks(feedbackData)
      }
      
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
      const response = await apiClient.submitAnswer(quizId, currentQuestion.id, selectedAnswer)
      
      // Update local state
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        selected_choice_id: selectedAnswer
      }
      setQuizData({ ...quizData, questions: updatedQuestions })
      
      // If feedback mode is immediate, store and show feedback
      if (quizData.quiz.feedbackMode === 'immediate' && response.feedback) {
        setFeedbacks({
          ...feedbacks,
          [currentQuestion.id]: response.feedback
        })
        setShowFeedback(true)
        
        // Scroll to feedback after a brief delay to ensure DOM is updated
        setTimeout(() => {
          const feedbackElement = document.getElementById('feedback-section')
          if (feedbackElement) {
            feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } else {
        // Move to next question if not showing feedback
        if (currentQuestionIndex < quizData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer(null)
        } else {
          // All questions answered, prompt to finish
          showToast('Todas as questões foram respondidas!', 'success')
        }
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
      // Update local state immediately for better UX
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        marked: newMarkedStatus
      }
      setQuizData({ ...quizData, questions: updatedQuestions })
      
      // Then update backend
      await apiClient.markQuestion(quizId, currentQuestion.id, newMarkedStatus)
      
      showToast(
        newMarkedStatus ? 'Questão marcada para revisão' : 'Marcação removida',
        'success'
      )
    } catch (error) {
      console.error('Error marking question:', error)
      // Revert on error
      const revertedQuestions = [...quizData.questions]
      revertedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        marked: !newMarkedStatus
      }
      setQuizData({ ...quizData, questions: revertedQuestions })
      showToast('Erro ao marcar questão', 'error')
    }
  }

  const handleFinishQuiz = async () => {
    try {
      setSubmitting(true)
      const response = await apiClient.finishQuiz(quizId)
      showToast(`Quiz finalizado! Acertos: ${response.data?.correct}/${response.data?.total}`, 'success')
      router.push(`/quizzes/${quizId}/feedback`)
    } catch (error : any) {
      console.error('Error finishing quiz:', error)
      console.log(error, 1381328)
      if(error?.message === 'Quiz already finished') {
        router.push(`/quizzes/${quizId}/feedback`)
      } else {
      showToast('Erro ao finalizar quiz', 'error')
      }
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

  // Check if we should show feedback for current question
  // Must be before conditional returns to follow React hooks rules
  useEffect(() => {
    if (quizData?.quiz.feedbackMode === 'immediate' && quizData.questions[currentQuestionIndex]) {
      const currentQ = quizData.questions[currentQuestionIndex]
      // Show feedback if this question was already answered
      if (currentQ.selected_choice_id && feedbacks[currentQ.id]) {
        setShowFeedback(true)
        setSelectedAnswer(currentQ.selected_choice_id)
      } else {
        setShowFeedback(false)
        setSelectedAnswer(currentQ.selected_choice_id)
      }
    }
    // Scroll to top when changing questions
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentQuestionIndex, feedbacks, quizData])
  
  // Memoize the processed HTML to avoid re-rendering on timer updates
  // These MUST be before any conditional returns
  const currentQuestion = quizData?.questions[currentQuestionIndex]
  
  const processedStatement = useMemo(() => {
    if (!currentQuestion) return ''
    return currentQuestion.statement.includes('<') && currentQuestion.statement.includes('>') 
      ? currentQuestion.statement 
      : currentQuestion.statement.replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  }, [currentQuestion?.statement])
  
  const processedChoices = useMemo(() => {
    if (!currentQuestion) return []
    return currentQuestion.choices.map(choice => ({
      ...choice,
      processedHtml: choice.description.includes('<') && choice.description.includes('>') 
        ? choice.description 
        : choice.description.replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }))
  }, [currentQuestion?.choices])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts only when submitting
      if (submitting) return
      
      // Arrow keys for navigation (always enabled)
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentQuestionIndex(prev => Math.min((quizData?.questions?.length || 1) - 1, prev + 1))
      }
      
      // Number keys for selecting choices (1-5) - only if question not answered
      if (currentQuestion && !currentQuestion.selected_choice_id && !showFeedback) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 5 && processedChoices[num - 1]) {
          e.preventDefault()
          setSelectedAnswer(processedChoices[num - 1].id)
        }
      }
      
      // Enter to confirm answer - only if question not answered
      if (e.key === 'Enter' && selectedAnswer && !currentQuestion?.selected_choice_id && !showFeedback) {
        e.preventDefault()
        handleSubmitAnswer()
      }
      
      // R key to mark/unmark question for review
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleMarkQuestion()
      }
      
      // Escape to toggle shortcuts help (always enabled)
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestion, selectedAnswer, showFeedback, submitting, processedChoices, quizData, handleSubmitAnswer, handleMarkQuestion])
  
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

  // Now we can safely use non-nullable currentQuestion
  const answeredQuestions = quizData.questions.filter(q => q.selected_choice_id !== null).length
  const progress = (answeredQuestions / quizData.questions.length) * 100
  
  // Extra safety check
  if (!currentQuestion) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Erro ao carregar questão</p>
          </div>
        </div>
      </>
    )
  }
  
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
                <h1 className="text-lg font-bold text-gray-800">
                  {quizData.quiz.name || `Quiz #${quizId}`}
                </h1>
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
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            {/* Left Sidebar - Keyboard Shortcuts */}
            <div className="lg:col-span-2">
              {showShortcuts && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sticky top-4">
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-2 mb-3">
                    <Keyboard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <h4 className="font-semibold text-blue-900 text-sm">Atalhos</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">←</kbd>
                      <span className="text-gray-700">Anterior</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">→</kbd>
                      <span className="text-gray-700">Próxima</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">1-5</kbd>
                      <span className="text-gray-700">Alternativa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">↵</kbd>
                      <span className="text-gray-700">Confirmar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">R</kbd>
                      <span className="text-gray-700">Revisar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd>
                      <span className="text-gray-700">Ocultar</span>
                    </div>
                  </div>
                </div>
              )}
              {!showShortcuts && (
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 w-full flex items-center justify-center transition-colors"
                  title="Mostrar atalhos do teclado"
                >
                  <Keyboard className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Center - Question Component */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                {/* Subject and Topic Badges */}
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
                  {currentQuestion.topic && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {currentQuestion.topic.name}
                    </span>
                  )}
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Questão {currentQuestionIndex + 1}
                  </h2>
                  <div 
                    className="prose-quiz"
                    dangerouslySetInnerHTML={{ __html: processedStatement }}
                  />
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {processedChoices.map((choice) => (
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
                      <div className="flex items-center gap-3">
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
                          dangerouslySetInnerHTML={{ __html: choice.processedHtml }}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Immediate Feedback Display */}
                {quizData.quiz.feedbackMode === 'immediate' && showFeedback && feedbacks[currentQuestion.id] && (
                  <div id="feedback-section" className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <div className="mb-4">
                      {feedbacks[currentQuestion.id].isCorrect ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          Resposta Correta!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 font-semibold">
                          <XCircle className="w-5 h-5" />
                          Resposta Incorreta
                        </div>
                      )}
                    </div>
                    
                    {!feedbacks[currentQuestion.id].isCorrect && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Resposta correta:</p>
                        <div 
                          className="font-medium text-gray-800 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: feedbacks[currentQuestion.id].correctAnswer.includes('<') && feedbacks[currentQuestion.id].correctAnswer.includes('>') 
                              ? feedbacks[currentQuestion.id].correctAnswer 
                              : feedbacks[currentQuestion.id].correctAnswer.replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                          }}
                        />
                      </div>
                    )}
                    
                    {feedbacks[currentQuestion.id].explanation && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Explicação:</p>
                        <div 
                          className="text-gray-800 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: feedbacks[currentQuestion.id].explanation.includes('<') && feedbacks[currentQuestion.id].explanation.includes('>') 
                              ? feedbacks[currentQuestion.id].explanation 
                              : feedbacks[currentQuestion.id].explanation.replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Video Player */}
                    {feedbacks[currentQuestion.id].video && (
                      <div className="mt-6">
                        <div className="mb-2 flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-semibold text-purple-600">Vídeo Explicativo Disponível</p>
                        </div>
                        <VdoCipherPlayerFinal
                          videoId={feedbacks[currentQuestion.id].video.videoId}
                          title={feedbacks[currentQuestion.id].video.name}
                          description={feedbacks[currentQuestion.id].video.description}
                          teacherName={feedbacks[currentQuestion.id].video.teacherName}
                          duration={feedbacks[currentQuestion.id].video.duration}
                          thumbnail={feedbacks[currentQuestion.id].video.thumbnail}
                        />
                      </div>
                    )}
                  </div>
                )}

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
                    {currentQuestion.selected_choice_id === null && selectedAnswer && !showFeedback && (
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
            </div>

            {/* Right Sidebar - Question Navigator */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sticky top-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Questões
                </h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {quizData.questions.map((question, index) => {
                    // Check if question is correct/incorrect for immediate mode
                    const isAnswered = question.selected_choice_id !== null
                    const isCorrect = quizData.quiz.feedbackMode === 'immediate' && isAnswered && feedbacks[question.id]?.isCorrect
                    const isIncorrect = quizData.quiz.feedbackMode === 'immediate' && isAnswered && feedbacks[question.id] && !feedbacks[question.id].isCorrect
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`p-1.5 rounded text-xs font-medium transition-all relative ${
                          index === currentQuestionIndex
                            ? 'bg-red-500 text-white'
                            : isCorrect
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : isIncorrect
                            ? 'bg-red-400 text-white hover:bg-red-500'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${question.marked ? 'ring-2 ring-yellow-400' : ''}`}
                        title={`Questão ${index + 1}${question.marked ? ' (Revisar)' : ''}${isCorrect ? ' (Correta)' : isIncorrect ? ' (Incorreta)' : ''}`}
                      >
                        {index + 1}
                        {/* Indicator for correct/incorrect in immediate mode */}
                        {quizData.quiz.feedbackMode === 'immediate' && isAnswered && feedbacks[question.id] && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white">
                            {isCorrect ? (
                              <CheckCircle className="w-full h-full text-green-600 bg-white rounded-full" />
                            ) : (
                              <XCircle className="w-full h-full text-red-600 bg-white rounded-full" />
                            )}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  {quizData.quiz.feedbackMode === 'immediate' ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Correta</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-red-400 rounded"></div>
                        <span>Incorreta</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <span>Não respondida</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-100 rounded ring-2 ring-yellow-400"></div>
                        <span>Revisar</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-100 rounded"></div>
                        <span>Respondida</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <span>Não respondida</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-100 rounded ring-2 ring-yellow-400"></div>
                        <span>Revisar</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}