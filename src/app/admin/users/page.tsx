'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Plus, Trash2, Shield, User, Mail, Loader2, X
} from 'lucide-react'
import apiClient from '@/lib/api'

interface UserRow {
  id: number
  name: string
  email: string
  role: 'admin' | 'moderator'
  is_active: boolean
  created_at: string
}

const ROLE_CONFIG: Record<string, { color: string; label: string }> = {
  admin: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
  moderator: { color: 'bg-green-100 text-green-800', label: 'Moderador' }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getUsers()
      setUsers(res.data || [])
    } catch (e) {
      console.error('Erro ao carregar usuários:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-600 mt-2">Administradores e moderadores do sistema</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard count={users.length} label="Total" icon={<User className="w-10 h-10 text-blue-600" />} />
        <StatCard count={users.filter(u => u.role === 'admin').length} label="Administradores"
          icon={<Shield className="w-10 h-10 text-red-600" />} />
        <StatCard count={users.filter(u => u.role === 'moderator').length} label="Moderadores"
          icon={<User className="w-10 h-10 text-green-600" />} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Buscar por nome ou email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum usuário encontrado</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Usuário</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Papel</th>
                <th className="px-6 py-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(u => {
                const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.moderator
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-900">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center"><Mail className="w-4 h-4 mr-2" />{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSaved={async () => { setShowModal(false); await load() }}
        />
      )}
    </div>
  )
}

function StatCard({ count, label, icon }: { count: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'moderator'>('moderator')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Preencha todos os campos')
      return
    }
    setSaving(true)
    try {
      await apiClient.createUser({ name: name.trim(), email: email.trim(), password, role })
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao criar usuário')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Novo Usuário</h2>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="moderator">Moderador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar
          </button>
        </div>
      </div>
    </div>
  )
}
