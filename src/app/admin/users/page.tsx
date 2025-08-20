'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield,
  User,
  Mail,
  Calendar
} from 'lucide-react'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [users] = useState<any[]>([])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleDelete = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      console.log('Delete user:', userId)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
      operator: { color: 'bg-blue-100 text-blue-800', label: 'Operador' },
      moderator: { color: 'bg-green-100 text-green-800', label: 'Moderador' },
      subscriber: { color: 'bg-gray-100 text-gray-800', label: 'Assinante' },
    }
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.subscriber
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
            <p className="text-gray-600 mt-2">Gerencie os usuários administrativos do sistema</p>
          </div>
          <Link
            href="/admin/users/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Usuário
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              <p className="text-sm text-gray-600">Total de Usuários</p>
            </div>
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-600">Administradores</p>
            </div>
            <Shield className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'operator').length}
              </p>
              <p className="text-sm text-gray-600">Operadores</p>
            </div>
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'moderator').length}
              </p>
              <p className="text-sm text-gray-600">Moderadores</p>
            </div>
            <User className="w-10 h-10 text-green-600" />
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
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Papéis</option>
              <option value="admin">Administrador</option>
              <option value="operator">Operador</option>
              <option value="moderator">Moderador</option>
              <option value="subscriber">Assinante</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Papel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleConfig = getRoleBadge(user.role)
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleConfig.color}`}>
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(user.created).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id.toString())}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                          disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
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
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredUsers.length}</span> de{' '}
            <span className="font-medium">{filteredUsers.length}</span> resultados
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