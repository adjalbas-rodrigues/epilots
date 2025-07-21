'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há token salvo e validar
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Tentar buscar o perfil do usuário
          const response = await apiClient.getStudentProfile()
          if (response.data) {
            setUser(response.data)
          }
        } catch (error) {
          // Token inválido, limpar
          apiClient.clearToken()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      let response
      if (isAdmin) {
        response = await apiClient.loginAdmin(email, password)
        if (response.user) {
          setUser(response.user)
          router.push('/admin/home')
        }
      } else {
        response = await apiClient.loginStudent(email, password)
        if (response.student) {
          setUser(response.student)
          router.push('/quizzes')
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha ao fazer login')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.registerStudent(name, email, password)
      if (response.student) {
        setUser(response.student)
        router.push('/quizzes')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha ao registrar')
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}