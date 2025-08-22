'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginSuccess, logout as logoutAction, setLoading } from '@/store/slices/authSlice'
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
  isAuthenticated: boolean
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { user, isLoading, token } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    // Check for saved token on mount
    const checkAuth = () => {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        try {
          const userObj = JSON.parse(savedUser)
          dispatch(loginSuccess({ user: userObj, token: savedToken }))
          apiClient.setToken(savedToken)
        } catch (error) {
          // Invalid saved data, clear it
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      dispatch(setLoading(false))
    }
    
    checkAuth()
  }, [dispatch])

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      let response
      if (isAdmin) {
        response = await apiClient.loginAdmin(email, password)
        if (response.user && response.token) {
          // Save to localStorage for persistence
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          dispatch(loginSuccess({ user: response.user, token: response.token }))
          router.push('/admin/home')
        }
      } else {
        response = await apiClient.loginStudent(email, password)
        if (response.student && response.token) {
          // Save to localStorage for persistence
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('auth_user', JSON.stringify(response.student))
          dispatch(loginSuccess({ user: response.student, token: response.token }))
          
          // Check if user needs to change password
          if (response.student.must_change_password) {
            router.push('/auth/change-password')
          } else {
            router.push('/auth/account')
          }
        } else if (response.data?.student && response.data?.token) {
          // Save to localStorage for persistence
          localStorage.setItem('auth_token', response.data.token)
          localStorage.setItem('auth_user', JSON.stringify(response.data.student))
          dispatch(loginSuccess({ user: response.data.student, token: response.data.token }))
          
          // Check if user needs to change password
          if (response.data.student.must_change_password) {
            router.push('/auth/change-password')
          } else {
            router.push('/auth/account')
          }
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
        // Save to localStorage for persistence
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('auth_user', JSON.stringify(response.student))
        dispatch(loginSuccess({ user: response.student, token: response.token }))
        router.push('/auth/account')
      } else if (response.data?.student && response.data?.token) {
        // Save to localStorage for persistence
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('auth_user', JSON.stringify(response.data.student))
        dispatch(loginSuccess({ user: response.data.student, token: response.data.token }))
        router.push('/auth/account')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha ao registrar')
    }
  }

  const logout = () => {
    // Clear all tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token')
      localStorage.removeItem('student_token')
      localStorage.removeItem('admin_token')
    }
    
    apiClient.clearToken()
    dispatch(logoutAction())
    router.push('/auth/login')
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, register }}>
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