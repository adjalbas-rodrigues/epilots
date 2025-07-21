'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, 
  Lock, 
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Settings,
  Users,
  BarChart3,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check mock credentials
      if (formData.email === 'admin@epilots.com' && formData.password === 'admin123') {
        localStorage.setItem('admin_token', 'mock_token_admin')
        router.push('/cms')
      } else {
        setError('Email ou senha inválidos')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm mb-8 border border-white/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Área Administrativa</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Gerencie sua plataforma com poder
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Acesso completo para administrar questões, alunos, estatísticas e todo o sistema Elite Pilots.
            </p>

            {/* Feature List */}
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gestão de Alunos</h3>
                  <p className="text-sm text-white/70">Cadastre e acompanhe o progresso</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Controle Total</h3>
                  <p className="text-sm text-white/70">Gerencie questões e matérias</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Analytics Completo</h3>
                  <p className="text-sm text-white/70">Visualize estatísticas detalhadas</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold">6k+</p>
                <p className="text-xs text-white/70">Questões</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold">1.2k</p>
                <p className="text-xs text-white/70">Alunos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold">126</p>
                <p className="text-xs text-white/70">Assuntos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {/* Top Bar */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className={`w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Acesso Administrativo</h1>
              <p className="text-gray-600">Entre com suas credenciais de administrador</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Administrativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="admin@epilots.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <span className="ml-2 text-sm text-gray-600">Manter conectado</span>
                </label>
                <Link
                  href="/cms/auth/password/request"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                } flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Acessando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Painel Admin</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Aviso de Segurança
              </p>
              <p className="text-sm text-amber-700">
                Este é um acesso restrito. Todas as ações são registradas e monitoradas.
              </p>
            </div>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Credenciais de teste:
              </p>
              <p className="text-sm text-blue-700">Email: admin@epilots.com</p>
              <p className="text-sm text-blue-700">Senha: admin123</p>
            </div>

            {/* Back to Student Login */}
            <div className="mt-8 text-center">
              <Link 
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Voltar para login de aluno →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-8 text-center text-sm text-gray-500">
          <p>© 2025 Elite Pilots - Sistema Administrativo</p>
        </div>
      </div>
    </div>
  )
}