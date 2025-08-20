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
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('student_token')
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  useEffect(() => {
    // Show success toast only once when component mounts
    const hasShownToast = sessionStorage.getItem('loginToastShown')
    if (!hasShownToast) {
      showToast('Login efetuado com sucesso!', 'success')
      sessionStorage.setItem('loginToastShown', 'true')
    }
  }, [showToast])

  return (
    <>
      <Navbar isAuthenticated={true} userName={student.name} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-8 grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <BookOpen className="w-10 h-10 mb-3 opacity-80" />
                <h4 className="text-3xl font-bold">150</h4>
                <p className="text-blue-100 text-sm mt-1">Questões Respondidas</p>
              </div>
              <BookOpen className="w-16 h-16 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <Target className="w-10 h-10 mb-3 opacity-80" />
                <h4 className="text-3xl font-bold">78%</h4>
                <p className="text-green-100 text-sm mt-1">Taxa de Acerto</p>
              </div>
              <Target className="w-16 h-16 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
                <h4 className="text-3xl font-bold">12</h4>
                <p className="text-purple-100 text-sm mt-1">Simulados Completos</p>
              </div>
              <BarChart3 className="w-16 h-16 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <Clock className="w-10 h-10 mb-3 opacity-80" />
                <h4 className="text-3xl font-bold">5</h4>
                <p className="text-orange-100 text-sm mt-1">Dias Consecutivos</p>
              </div>
              <Clock className="w-16 h-16 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">INÍCIO</h2>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Como Funciona</h3>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong className="text-red-600">1.</strong> Clique em &quot;Gerar Quest&quot;, no lado direito desta página.
              </p>
              
              <p>
                <strong className="text-red-600">2.</strong> Selecione os assuntos: escolha um ou mais itens dentre os 126 assuntos em que foi divida a bibliografia recomendada, ou selecione &quot;todos os assuntos&quot;.
              </p>
              
              <p>
                <strong className="text-red-600">3.</strong> Aplique um dos seguintes Filtros:
              </p>
              
              <ul className="ml-6 space-y-2">
                <li>– Todas as Questões: gera um Quest com todas as questões do banco (já respondidas ou não pelo aluno), dentro dos assuntos selecionados;</li>
                <li>– Questões Inéditas: gera um Quest apenas com questões ainda não respondidas pelo aluno, dentro dos assuntos selecionados;</li>
                <li>– Questões que Errei: gera um Quest apenas com questões que o aluno já respondeu, mas errou, dentro dos assuntos selecionados;</li>
                <li>– Superquest: gera um Quest de 70 questões versando sobre todos os assuntos do conteúdo programático.</li>
              </ul>
            </div>
          </div>

          <div className="text-right">
            <Link href="/quizzes/create" className="btn-epilots btn-epilots-lg btn-epilots-primary">
              GERAR QUEST
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}