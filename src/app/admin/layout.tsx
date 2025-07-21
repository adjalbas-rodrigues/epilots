'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/auth/login'

  useEffect(() => {
    if (!isLoginPage) {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin/auth/login')
      }
    }
  }, [router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}