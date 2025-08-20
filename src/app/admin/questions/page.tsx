'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  BookOpen,
  CheckCircle,
  XCircle,
  FileQuestion
} from 'lucide-react'
export default function AdminQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [questions] = useState<any[]>([])

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.id.toString().includes(searchTerm)
    const matchesSubject = selectedSubject === 'all' || question.subject_id.toString() === selectedSubject
    return matchesSearch && matchesSubject
  })

  const handleDelete = (questionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      console.log('Delete question:', questionId)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Questões</h1>
            <p className="text-gray-600 mt-2">Gerencie o banco de questões do sistema</p>
          </div>
          <Link
            href="/admin/questions/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Questão
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{questions.length}</p>
              <p className="text-sm text-gray-600">Total de Questões</p>
            </div>
            <FileQuestion className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-sm text-gray-600">Matérias</p>
            </div>
            <BookOpen className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {questions.filter(q => q.answers && q.answers.length > 0).length}
              </p>
              <p className="text-sm text-gray-600">Com Respostas</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {questions.filter(q => !q.answers || q.answers.length === 0).length}
              </p>
              <p className="text-sm text-gray-600">Sem Respostas</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por enunciado, título ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Matérias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matéria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enunciado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respostas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => {
                const subject = null
                return (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{question.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {question.title || 'Sem título'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        -
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {question.statement}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.answers?.length || 0} opções
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/questions/${question.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/questions/${question.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(question.id.toString())}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredQuestions.length}</span> de{' '}
            <span className="font-medium">{filteredQuestions.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
              Anterior
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}