'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileQuestion,
  BarChart3,
  LogOut,
  Shield
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { href: '/admin/home', label: 'Dashboard', icon: Home },
    { href: '/admin/students', label: 'Alunos', icon: GraduationCap },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/subjects', label: 'Matérias', icon: BookOpen },
    { href: '/admin/questions', label: 'Questões', icon: FileQuestion },
    { href: '/admin/statistics', label: 'Estatísticas', icon: BarChart3 },
  ]

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/auth/login'
  }

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-10 h-10 text-green-400" />
          <div>
            <h2 className="text-xl font-bold">EPilots</h2>
            <p className="text-sm text-gray-400">Painel Admin</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  )
}