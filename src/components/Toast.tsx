'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  if (!isVisible) return null

  const typeConfig = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: CheckCircle,
      iconColor: 'text-white',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: X,
      iconColor: 'text-white',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: Info,
      iconColor: 'text-white',
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: AlertCircle,
      iconColor: 'text-white',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
      isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className={`${config.bg} rounded-2xl shadow-2xl p-4 pr-12 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <p className="text-white font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}