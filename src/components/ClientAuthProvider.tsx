'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/hooks/useAppSelector'
import apiClient from '@/lib/api'

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Sincronizar o token do Redux com o apiClient
    if (token && isAuthenticated) {
      apiClient.setToken(token)
    } else if (!isAuthenticated) {
      apiClient.clearToken()
    }
  }, [token, isAuthenticated])

  return <>{children}</>
}