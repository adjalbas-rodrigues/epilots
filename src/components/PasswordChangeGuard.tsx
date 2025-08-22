'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface PasswordChangeGuardProps {
  children: React.ReactNode
}

export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPasswordChange = () => {
      // Get user data from localStorage
      const userData = localStorage.getItem('auth_user')
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          
          // If user must change password and is not on the change password page
          if (parsedUser.must_change_password && pathname !== '/auth/change-password') {
            router.push('/auth/change-password')
            return
          }
          
          // If user doesn't need to change password but is on the change password page
          if (!parsedUser.must_change_password && pathname === '/auth/change-password') {
            router.push('/auth/account')
            return
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      
      setIsChecking(false)
    }

    checkPasswordChange()
  }, [pathname, router, user])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return <>{children}</>
}