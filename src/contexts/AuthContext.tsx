'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginSuccess, logout as logoutAction, setLoading, setAuthFromStorage } from '@/store/slices/authSlice'
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
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há token salvo e validar
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        if (token) {
          // Setar o token no apiClient primeiro
          apiClient.setToken(token)
          
          try {
            // Tentar buscar o perfil do usuário
            const response = await apiClient.getStudentProfile()
            if (response.data) {
              dispatch(setAuthFromStorage({ user: response.data, token }))
            }
          } catch (error) {
            // Token inválido, limpar
            apiClient.clearToken()
            dispatch(logoutAction())
          }
        } else {
          dispatch(setLoading(false))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        dispatch(setLoading(false))
      }
    }

    checkAuth()
  }, [dispatch])

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      let response
      if (isAdmin) {
        response = await apiClient.loginAdmin(email, password)
        if (response.user && response.token) {
          dispatch(loginSuccess({ user: response.user, token: response.token }))
          router.push('/admin/home')
        }
      } else {
        response = await apiClient.loginStudent(email, password)
        if (response.student && response.token) {
          dispatch(loginSuccess({ user: response.student, token: response.token }))
          router.push('/quizzes')
        } else if (response.data?.student && response.data?.token) {
          dispatch(loginSuccess({ user: response.data.student, token: response.data.token }))
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
      if (response.student && response.token) {
        dispatch(loginSuccess({ user: response.student, token: response.token }))
        router.push('/quizzes')
      } else if (response.data?.student && response.data?.token) {
        dispatch(loginSuccess({ user: response.data.student, token: response.data.token }))
        router.push('/quizzes')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha ao registrar')
    }
  }

  const logout = () => {
    apiClient.clearToken()
    dispatch(logoutAction())
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