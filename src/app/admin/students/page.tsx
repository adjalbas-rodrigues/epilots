'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Mail,
  Lock,
  Unlock,
  Filter
} from 'lucide-react'

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'liberado' | 'bloqueado'>('all')
  const [students] = useState<any[]>([])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = (studentId: string) => {
    // In real app, this would update the student status
    console.log('Toggle status for student:', studentId)
  }

  const handleDelete = (studentId: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      // In real app, this would delete the student
      console.log('Delete student:', studentId)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Alunos</h1>
            <p className="text-gray-600 mt-2">Gerencie os alunos cadastrados no sistema</p>
          </div>
          <Link
            href="/admin/students/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Aluno
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="liberado">Liberados</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apelido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.nickname || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'liberado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'liberado' ? 'Liberado' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.created).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(student.id.toString())}
                        className={student.status === 'liberado' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        title={student.status === 'liberado' ? 'Bloquear' : 'Liberar'}
                      >
                        {student.status === 'liberado' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(student.id.toString())}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredStudents.length}</span> de{' '}
            <span className="font-medium">{filteredStudents.length}</span> resultados
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