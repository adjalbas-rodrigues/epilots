'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen,
  CheckCircle,
  FileQuestion
} from 'lucide-react'

export default function AdminSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [subjects] = useState<any[]>([])

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getQuestionCount = (subjectId: string) => {
    return 0
  }

  const handleDelete = (subjectId: string) => {
    const questionCount = getQuestionCount(subjectId)
    if (questionCount > 0) {
      alert(`Não é possível excluir esta matéria pois existem ${questionCount} questões vinculadas.`)
      return
    }
    
    if (confirm('Tem certeza que deseja excluir esta matéria?')) {
      console.log('Delete subject:', subjectId)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Matérias</h1>
            <p className="text-gray-600 mt-2">Gerencie as matérias do sistema</p>
          </div>
          <Link
            href="/admin/subjects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Matéria
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
              <p className="text-sm text-gray-600">Total de Matérias</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {subjects.filter(s => s.super_quest).length}
              </p>
              <p className="text-sm text-gray-600">Super Quest</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-sm text-gray-600">Total de Questões</p>
            </div>
            <FileQuestion className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar matérias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => {
          const questionCount = getQuestionCount(subject.id.toString())
          
          return (
            <div key={subject.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {subject.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FileQuestion className="w-4 h-4 mr-1" />
                      {questionCount} questões
                    </span>
                    {subject.super_quest && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Super Quest
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <Link
                  href={`/admin/subjects/${subject.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(subject.id.toString())}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Add New Card */}
        <Link
          href="/admin/subjects/create"
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[180px]"
        >
          <Plus className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600">Adicionar Nova Matéria</span>
        </Link>
      </div>
    </div>
  )
}