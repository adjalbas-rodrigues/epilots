'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Início', href: '/auth/account' }
    ]
    
    // Build breadcrumb path
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Skip auth prefix
      if (path === 'auth' && index === 0) return
      
      // Handle different routes
      let label = path
      
      // Custom labels for specific routes
      const routeLabels: { [key: string]: string } = {
        'account': 'Dashboard',
        'quizzes': 'Quests',
        'create': 'Criar Quest',
        'perform': 'Realizar Quest',
        'feedback': 'Feedback',
        'statistics': 'Estatísticas',
        'cms': 'Admin',
        'students': 'Alunos',
        'subjects': 'Matérias',
        'questions': 'Questões',
        'users': 'Usuários',
        'edit': 'Editar'
      }
      
      // Check if it's a numeric ID
      if (!isNaN(Number(path))) {
        label = `Quest #${path}`
      } else {
        label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1)
      }
      
      // Don't link the last item (current page)
      const isLast = index === paths.length - 1
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs on home or login pages
  if (pathname === '/' || pathname.includes('/login') || breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center py-3 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index === 0 ? (
                <Home className="w-4 h-4 text-gray-400 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-semibold">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}