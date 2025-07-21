'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import Toast from '@/components/Toast'

interface ToastContextProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{
    id: number
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration: number
  }>>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ transform: `translateY(${index * 80}px)` }}
            className="transition-transform duration-300"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}