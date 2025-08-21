'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Hash,
  UserCheck,
  Sparkles,
  Trophy,
  BarChart3,
  Activity
} from 'lucide-react'

interface ProfileData {
  id: number
  name: string
  email: string
  phone?: string
  birth_date?: string
  registration_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Statistics {
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  wrongAnswers: number
  accuracyRate: string
  subjectPerformance: Array<{
    id: number
    name: string
    total: number
    correct: number
    percentage: number
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: ''
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Profile image (placeholder for now)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login')
    } else if (isAuthenticated) {
      fetchProfile()
      fetchStatistics()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getStudentProfile()
      const data = response.data
      setProfileData(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Erro ao carregar perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.request('/student/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: profileData?.name || '',
      phone: profileData?.phone || '',
      birth_date: profileData?.birth_date ? profileData.birth_date.split('T')[0] : ''
    })
  }

  const handleSave = async () => {
    // Validate name
    if (!formData.name || formData.name.length < 3) {
      showToast('Nome deve ter pelo menos 3 caracteres', 'error')
      return
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneRegex = /^(\+\d{1,3})?(\d{10,11})$/
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (cleanPhone && !phoneRegex.test(cleanPhone)) {
        showToast('Telefone inválido. Use o formato (00) 00000-0000', 'error')
        return
      }
    }

    // Validate birth date if provided
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (birthDate > today) {
        showToast('Data de nascimento não pode ser no futuro', 'error')
        return
      }
      
      if (age > 120) {
        showToast('Data de nascimento inválida', 'error')
        return
      }
    }

    try {
      setIsSaving(true)
      const response = await apiClient.updateStudentProfile(formData)
      
      if (response.status === 'success') {
        showToast('Perfil atualizado com sucesso!', 'success')
        setProfileData(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('As senhas não coincidem', 'error')
      return
    }

    if (passwordForm.new_password.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres', 'error')
      return
    }

    try {
      setIsSaving(true)
      const response = await apiClient.changePassword(
        passwordForm.current_password,
        passwordForm.new_password
      )
      
      if (response.status === 'success') {
        showToast('Senha alterada com sucesso!', 'success')
        setIsChangingPassword(false)
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      showToast(error.message || 'Erro ao alterar senha', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB', 'error')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        // TODO: Implement actual upload to backend
        showToast('Funcionalidade de upload será implementada em breve', 'info')
      }
      reader.readAsDataURL(file)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getMembershipDuration = () => {
    if (!profileData?.created_at) return '0 dias'
    const created = new Date(profileData.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
    return `${Math.floor(diffDays / 365)} anos`
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  if (loading || authLoading) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-8">
              <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full animate-pulse mb-6"></div>
                  <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-6 w-36 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                  <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}>
                        <div className="h-5 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto relative group">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        profileData?.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-white group-hover:scale-110 transition-transform"
                    >
                      <Camera className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Name and Email */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {profileData?.name}
                  </h2>
                  <p className="text-gray-600">{profileData?.email}</p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                  {profileData?.is_active ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Conta Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Conta Inativa
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Membro há
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getMembershipDuration()}
                    </span>
                  </div>
                  {profileData?.registration_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Matrícula
                      </span>
                      <span className="font-semibold text-gray-800">
                        {profileData.registration_number}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      ID do Usuário
                    </span>
                    <span className="font-semibold text-gray-800">
                      #{profileData?.id}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sair da Conta
                </button>
              </div>

            </div>

            {/* Right Column - Information and Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Informações Pessoais
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                        placeholder="Seu nome completo"
                        required
                        minLength={3}
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{profileData?.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <p className="text-gray-800 font-medium">{profileData?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">
                        {profileData?.phone || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Birth Date Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data de Nascimento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">
                        {formatDate(profileData?.birth_date || '')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Segurança
                  </h3>
                </div>

                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Alterar Senha
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Digite a nova senha novamente"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordForm({
                            current_password: '',
                            new_password: '',
                            confirm_password: ''
                          })
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-1">Dicas de Segurança:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use uma senha forte com letras, números e símbolos</li>
                        <li>Não compartilhe sua senha com ninguém</li>
                        <li>Altere sua senha regularmente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirmar Saída</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair da sua conta?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    logout()
                    router.push('/auth/login')
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}