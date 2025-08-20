'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Hash,
  Key
} from 'lucide-react'

export default function EditAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    nickname: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if student is logged in
    const token = localStorage.getItem('student_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    // Load student data (mock)
    // const student = null - removed mock data
  }, [router])

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!profileData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter no mínimo 6 caracteres'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfileForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Perfil atualizado com sucesso!')
      router.push('/auth/account')
    } catch (error) {
      alert('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      alert('Erro ao alterar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link
              href="/auth/account"
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Editar Perfil</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Key className="w-5 h-5 inline-block mr-2" />
                Alterar Senha
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Nickname */}
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                    Apelido (Opcional)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="nickname"
                      value={profileData.nickname}
                      onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Como gostaria de ser chamado"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Salvando...</span>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Alterando...</span>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        Alterar Senha
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}