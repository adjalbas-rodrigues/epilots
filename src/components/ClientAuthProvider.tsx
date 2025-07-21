'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    // Sincronizar o token quando o componente montar no cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (token && !user) {
        // Se temos um token mas não temos usuário, algo está errado
        apiClient.setToken(token)
      }
    }
  }, [user])

  return <>{children}</>
}