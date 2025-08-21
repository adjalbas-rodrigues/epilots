'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'
import { Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function QuizRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = Number(params.id)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    checkQuizStatus()
  }, [user, quizId])

  const checkQuizStatus = async () => {
    try {
      const response = await apiClient.getQuiz(quizId)
      const quiz = response.data
      
      // Check if quiz is already finished
      if (quiz.quiz.finishedAt) {
        router.push(`/quizzes/${quizId}/feedback`)
        return
      }
      
      // Check if all questions are answered
      const allAnswered = quiz.questions.every((q: any) => q.selected_choice_id !== null)
      
      if (allAnswered) {
        // All questions answered, redirect to feedback
        router.push(`/quizzes/${quizId}/feedback`)
      } else {
        // Not all questions answered, redirect to perform
        router.push(`/quizzes/${quizId}/perform`)
      }
    } catch (error) {
      console.error('Error checking quiz status:', error)
      // On error, default to perform page
      router.push(`/quizzes/${quizId}/perform`)
    }
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando status do quiz...</p>
        </div>
      </div>
    </>
  )
}