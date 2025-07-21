'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  User,
  Mail,
  Calendar,
  Phone,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit2,
  X
} from 'lucide-react'

interface StudentProfile {
  id: number
  name: string
  email: string
  phone: string | null
  birth_date: string | null
  registration_number: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getStudentProfile()
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        birth_date: response.data.birth_date || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Erro ao carregar perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true)
      await apiClient.updateStudentProfile(formData)
      await fetchProfile()
      setEditMode(false)
      showToast('Perfil atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('As senhas nao coincidem', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres', 'error')
      return
    }

    try {
      setSaving(true)
      await apiClient.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordMode(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      showToast('Senha alterada com sucesso!', 'success')
    } catch (error) {
      console.error('Error changing password:', error)
      showToast('Erro ao alterar senha. Verifique sua senha atual.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nao informado'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Erro ao carregar perfil</p>
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3">
                <User className="w-10 h-10 text-red-600" />
                <h1 className="text-4xl font-bold text-gray-800">Meu Perfil</h1>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Informacoes Pessoais</h2>
                {!editMode && !passwordMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              {!editMode && !passwordMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Nome</label>
                      <p className="text-lg font-medium text-gray-800">{profile.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">E-mail</label>
                      <p className="text-lg font-medium text-gray-800">{profile.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">Telefone</label>
                      <p className="text-lg font-medium text-gray-800">
                        {profile.phone || 'Nao informado'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">Data de Nascimento</label>
                      <p className="text-lg font-medium text-gray-800">
                        {formatDate(profile.birth_date)}
                      </p>
                    </div>
                    
                    {profile.registration_number && (
                      <div>
                        <label className="text-sm text-gray-500">Numero de Registro</label>
                        <p className="text-lg font-medium text-gray-800">{profile.registration_number}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-gray-500">Membro desde</label>
                      <p className="text-lg font-medium text-gray-800">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setPasswordMode(true)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Alterar Senha
                    </button>
                  </div>
                </div>
              ) : editMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar Alteracoes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          name: profile.name || '',
                          phone: profile.phone || '',
                          birth_date: profile.birth_date || ''
                        })
                      }}
                      disabled={saving}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Alterar Senha
                    </button>
                    <button
                      onClick={() => {
                        setPasswordMode(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      disabled={saving}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  logout()
                  router.push('/auth/login')
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}