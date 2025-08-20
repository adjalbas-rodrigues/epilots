'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  LogIn, 
  Target, 
  Trophy, 
  Brain, 
  Clock,
  Shield,
  Award,
  Zap,
  Star,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Rocket
} from 'lucide-react'

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <>
      <Navbar isAuthenticated={false} />
      
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section with Gradient Background */}
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
          <div className="text-center z-10 py-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/80 text-sm mb-8 border border-white/20">
              <Shield className="w-4 h-4" />
              <span>Líder em preparação para Práticos</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transforme sua
              <span className="block bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                preparação marítima
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Plataforma completa para dominar questões, realizar simulados e 
              acompanhar seu progresso rumo à aprovação no exame de Praticagem.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/auth/login"
                className="group px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 font-bold text-lg flex items-center justify-center gap-2"
              >
                Acessar Plataforma
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20 font-semibold text-lg"
              >
                Conhecer Recursos
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
                  <Shield className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">6k+</p>
                  <p className="text-white/60 text-sm">Questões Atualizadas</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">98%</p>
                  <p className="text-white/60 text-sm">Taxa de Aprovação</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">1.2k+</p>
                  <p className="text-white/60 text-sm">Alunos Ativos</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">24/7</p>
                  <p className="text-white/60 text-sm">Suporte Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta e metodologia comprovada para acelerar sua aprovação
            </p>
          </div>
          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Feature 1 */}
            <div 
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Banco de Questões Inteligente</h3>
                <p className="text-gray-600 mb-6">
                  Mais de 6.000 questões organizadas por assunto, com filtros avançados e questões inéditas personalizadas.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Questões atualizadas constantemente</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Filtro por dificuldade e tema</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Modo revisão de erros</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div 
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Analytics Avançado</h3>
                <p className="text-gray-600 mb-6">
                  Acompanhe seu progresso em tempo real com dashboards interativos e relatórios detalhados.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gráficos de evolução diária</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Análise por matéria</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Previsão de aprovação</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div 
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Simulados Personalizados</h3>
                <p className="text-gray-600 mb-6">
                  Crie simulados sob medida para suas necessidades, com cronômetro e ambiente idêntico ao da prova.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Simulados por tempo</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Superquest de 70 questões</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gabarito instantâneo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Access Cards */}
          <div className="flex justify-center max-w-4xl mx-auto">
            {/* Student Card */}
            <div className="group relative bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-1 hover:scale-105 transition-all duration-300 max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-700 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <Sparkles className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Área do Aluno</h3>
                <p className="text-gray-600 mb-6">
                  Acesse questões, simulados e acompanhe sua evolução rumo à aprovação.
                </p>
                <Link
                  href="/auth/login"
                  className="group flex items-center justify-between w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all font-semibold"
                >
                  <span>Entrar como Aluno</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Admin Card */}
            {/* <div className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-1 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Área Administrativa</h3>
                <p className="text-gray-600 mb-6">
                  Gerencie questões, alunos, matérias e visualize estatísticas completas.
                </p>
                <Link
                  href="/cms/auth/login"
                  className="group flex items-center justify-between w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all font-semibold"
                >
                  <span>Entrar como Admin</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Por que escolher o Elite Pilots?
              </h2>
              <p className="text-xl text-gray-600">
                Números que comprovam nossa excelência
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-red-50 to-red-100 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-12 h-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-800 mb-2">98%</h3>
                <p className="text-gray-600 font-semibold">Taxa de Aprovação</p>
                <p className="text-sm text-gray-500 mt-1">Nos últimos 2 anos</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-800 mb-2">6k+</h3>
                <p className="text-gray-600 font-semibold">Questões Atualizadas</p>
                <p className="text-sm text-gray-500 mt-1">Revisadas mensalmente</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-800 mb-2">1.2k+</h3>
                <p className="text-gray-600 font-semibold">Alunos Ativos</p>
                <p className="text-sm text-gray-500 mt-1">Comunidade crescente</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-800 mb-2">126</h3>
                <p className="text-gray-600 font-semibold">Assuntos Cobertos</p>
                <p className="text-sm text-gray-500 mt-1">Bibliografia completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>
        
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/80 text-sm mb-8 border border-white/20">
              <Rocket className="w-4 h-4" />
              <span>Comece agora mesmo</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para conquistar sua aprovação?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Junte-se a milhares de alunos que já estão se preparando com a melhor plataforma do Brasil
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="group px-8 py-4 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105 font-bold text-lg flex items-center justify-center gap-2"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className="text-white/60 text-sm mt-8">
              Não é necessário cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 mb-3 text-sm">
              © 2025 Elite Pilots - Sistema E-Quest. Todos os direitos reservados.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs">
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                Termos de Uso
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                Política de Privacidade
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}