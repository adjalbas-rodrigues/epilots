'use client'

import { useState, useEffect } from 'react'
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
  LogOut,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { mockStudents } from '@/mocks/data'

export default function CMSStudentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

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
            <Link href="/cms">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/cms/users">
              <Users className="w-4 h-4" />
              Usuários
            </Link>
            <Link href="/cms/students" className="active">
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Gerenciar Alunos</h2>
            <Link href="/cms/students/create" className="btn-epilots btn-epilots-primary">
              <Plus className="w-5 h-5" />
              Novo Aluno
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="table-epilots">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'liberado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status === 'liberado' ? 'Liberado' : 'Bloqueado'}
                      </span>
                    </td>
                    <td>{new Date(student.created).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link 
                          href={`/cms/students/${student.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {}}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}