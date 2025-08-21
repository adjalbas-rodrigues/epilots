'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  Plus,
  FileText,
  Trophy,
  Target,
  Clock,
  Sparkles
} from 'lucide-react'

interface NavbarProps {
  isAuthenticated?: boolean
  userName?: string
}

export default function Navbar({ isAuthenticated = false, userName = 'Aluno' }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('student_token')
    sessionStorage.removeItem('loginToastShown')
    router.push('/auth/login')
  }

  const navItems = [
    { 
      href: '/auth/account', 
      label: 'Início', 
      icon: Home,
    },
    { 
      href: '/quizzes', 
      label: 'Quests', 
      icon: BookOpen,
    },
    { 
      href: '/statistics', 
      label: 'Acompanhamento pedagógico', 
      icon: BarChart3,
    }
  ]

  const notifications = [
    { id: 1, text: 'Nova questão disponível!', time: '5 min', unread: true },
    { id: 2, text: 'Você completou 100 questões!', time: '1h', unread: true },
    { id: 3, text: 'Novo record de acertos!', time: '2h', unread: false }
  ]

  return (
    <>
      {/* Professional Header with Glass Morphism and Elegant Design */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isHomePage && !isScrolled
          ? 'bg-transparent py-6'
          : isScrolled 
            ? 'bg-red-900/95 backdrop-blur-xl shadow-2xl border-b border-red-800/30 py-0' 
            : 'bg-gradient-to-r from-red-800/90 to-red-900/90 backdrop-blur-md shadow-xl border-b border-red-700/20 py-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-lg blur-xl group-hover:bg-white/30 transition-all duration-500" />
                <Image 
                  src="/img/logo-epilots.png" 
                  alt="Elite Pilots" 
                  width={75.6} 
                  height={22.68}
                  priority
                  className="relative z-10 transition-transform group-hover:scale-110 duration-300"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-xl tracking-wider leading-none group-hover:text-yellow-300 transition-all duration-300">
                  ELITE PILOTS
                </span>
                <span className="text-white/70 text-xs tracking-[0.3em] leading-none mt-1 font-light">
                  PREPARAÇÃO EM ALTO NÍVEL
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isStatistics = item.href === '/statistics'
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        relative px-6 py-2.5 rounded-full font-medium text-sm
                        transition-all duration-300 group overflow-hidden
                        ${isActive 
                          ? isStatistics
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      )}
                      <span className="relative z-10 flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-transform ${
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`} />
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Search Button with Glass Effect */}
                  <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 group">
                    <Search className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                  </button>

                  {/* Notifications */}
                  {/* <div className="relative">
                    <button 
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 group"
                    >
                      <Bell className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                      </span>
                    </button>

            
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in slide-in-from-top-5">
                        <div className="p-4 border-b border-gray-100 bg-red-50">
                          <h3 className="font-semibold text-gray-800">Notificações</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                notif.unread ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                  notif.unread ? 'bg-red-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700">{notif.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button className="w-full text-sm text-red-600 hover:text-red-700 font-medium">
                            Ver todas as notificações
                          </button>
                        </div>
                      </div>
                    )}
                  </div> */}

                  {/* Profile Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 transition-all shadow-lg border border-red-600/30 group"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-inner">
                          <span className="text-red-700 font-bold text-sm">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-red-800" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {userName}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in slide-in-from-top-5">
                        <div className="p-4 border-b border-gray-100 bg-red-50">
                          <p className="font-semibold text-gray-800">{userName}</p>
                          <p className="text-sm text-gray-500">aluno@epilots.com</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            href="/profile" 
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Meu Perfil</span>
                          </Link>
                          <Link 
                            href="/settings" 
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Configurações</span>
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Sair</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 hover:border-white/20"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5 text-white transform rotate-0 transition-transform" />
                    ) : (
                      <Menu className="w-5 h-5 text-white transform rotate-0 transition-transform" />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/auth/login" 
                    className="px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full backdrop-blur-sm"
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isHomePage 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                        : 'text-red-900 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white'
                    }`}
                  >
                    Começar Agora
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-6 pt-20 bg-gradient-to-b from-red-50 to-white h-full">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isStatistics = item.href === '/statistics'
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-300
                        ${isActive 
                          ? isStatistics
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-red-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {}}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 w-full"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="font-medium">Limpar Questões Inéditas</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      {isAuthenticated && <div className="h-16" />}
    </>
  )
}