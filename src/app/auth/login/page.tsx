'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Lock, 
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Award,
  BookOpen,
  Zap,
  ChevronLeft,
  Sparkles
} from 'lucide-react'

export default function StudentLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
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
    
    // Redirect if already authenticated
    if (isAuthenticated && !isLoading) {
      router.push('/auth/account')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password, false)
      // Redirecionamento é feito automaticamente pelo AuthContext
    } catch (err: any) {
      setError(err.message || 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
              <Image 
                src="/img/logo-epilots.png" 
                alt="Elite Pilots" 
                width={200} 
                height={60}
                className="mx-auto mb-6"
                priority
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h1>
              <p className="text-gray-600">Entre para continuar sua jornada de preparação</p>
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
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
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
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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

              {/* <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <Link
                  href="/auth/password/request"
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                } flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar na Plataforma</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-gray-50 to-white text-gray-500">Novo por aqui?</span>
              </div>
            </div> */}

            {/* Sign Up Link */}
            {/* <div className="text-center">
              <p className="text-gray-600 mb-4">Ainda não tem uma conta?</p>
              <Link 
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold"
              >
                Criar conta gratuita
                <Sparkles className="w-5 h-5" />
              </Link>
            </div> */}

            {/* Test Credentials */}
            {/* <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Credenciais de teste:
              </p>
              <p className="text-sm text-blue-700">Email: joao@example.com</p>
              <p className="text-sm text-blue-700">Senha: 123456</p>
            </div> */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-8 text-center text-sm text-gray-500">
          <p>© 2025 Elite Pilots - Todos os direitos reservados</p>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 overflow-hidden items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Content */}
        <div className="relative z-10 p-12 w-full max-w-lg">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm mb-8 border border-white/20">
              <Award className="w-4 h-4" />
              <span>98% de aprovação</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Sua aprovação começa aqui
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Junte-se a mais de 1.200 alunos que já estão se preparando com a plataforma líder em preparação para Práticos de Navio.
            </p>

            {/* Feature List */}
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">21.000+ Questões</h3>
                  <p className="text-sm text-white/70">Banco atualizado mensalmente</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Simulados Inteligentes</h3>
                  <p className="text-sm text-white/70">Personalizados para seu nível</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Suporte 24/7</h3>
                  <p className="text-sm text-white/70">Tire suas dúvidas a qualquer hora</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-white/90 italic mb-4">
                &quot;O Elite Pilots foi fundamental para minha aprovação. A organização das questões e os simulados são perfeitos!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Cambreuvas</p>
                  <p className="text-xs text-white/70">Aprovado em 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}