'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home,
  Users,
  BookOpen,
  GraduationCap,
  FileQuestion,
  BarChart3,
  LogOut
} from 'lucide-react'

export default function CMSHomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/cms/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/cms/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CMS Header */}
      <div className="cms-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Image 
              src="/img/logo-epilots-white.png" 
              alt="Elite Pilots" 
              width={150} 
              height={45}
              priority
            />
            <button onClick={handleLogout} className="text-white hover:text-gray-200 flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="cms-nav">
        <div className="container mx-auto px-4">
          <nav>
            <Link href="/cms" className="active">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/cms/users">
              <Users className="w-4 h-4" />
              Usuários
            </Link>
            <Link href="/cms/students">
              <GraduationCap className="w-4 h-4" />
              Alunos
            </Link>
            <Link href="/cms/subjects">
              <BookOpen className="w-4 h-4" />
              Assuntos
            </Link>
            <Link href="/cms/questions">
              <FileQuestion className="w-4 h-4" />
              Questões
            </Link>
            <Link href="/cms/statistics">
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Painel Administrativo</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/cms/users" className="cms-dashboard-card">
              <Users className="w-12 h-12 text-red-600 mb-4" />
              <h3>Gerenciar Usuários</h3>
              <p>Adicione, edite e remova usuários administradores do sistema.</p>
            </Link>

            <Link href="/cms/students" className="cms-dashboard-card">
              <GraduationCap className="w-12 h-12 text-red-600 mb-4" />
              <h3>Gerenciar Alunos</h3>
              <p>Cadastre e gerencie os alunos que utilizam o sistema de questões.</p>
            </Link>

            <Link href="/cms/subjects" className="cms-dashboard-card">
              <BookOpen className="w-12 h-12 text-red-600 mb-4" />
              <h3>Gerenciar Assuntos</h3>
              <p>Organize os assuntos e tópicos disponíveis para as questões.</p>
            </Link>

            <Link href="/cms/questions" className="cms-dashboard-card">
              <FileQuestion className="w-12 h-12 text-red-600 mb-4" />
              <h3>Gerenciar Questões</h3>
              <p>Adicione, edite e organize as questões do banco de dados.</p>
            </Link>

            <Link href="/cms/statistics" className="cms-dashboard-card">
              <BarChart3 className="w-12 h-12 text-red-600 mb-4" />
              <h3>Estatísticas</h3>
              <p>Visualize relatórios e estatísticas de uso do sistema.</p>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">6,304</p>
              <p className="text-gray-600 mt-2">Total de Questões</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">126</p>
              <p className="text-gray-600 mt-2">Assuntos</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">458</p>
              <p className="text-gray-600 mt-2">Alunos Ativos</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">1,234</p>
              <p className="text-gray-600 mt-2">Quizzes Hoje</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}