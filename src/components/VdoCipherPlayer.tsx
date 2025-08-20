'use client'

import { useState, useEffect, useRef } from 'react'
import { Film, Play, X, Loader2, Clock, User } from 'lucide-react'
import apiClient from '@/lib/api'

interface VdoCipherPlayerProps {
  videoId: string
  title?: string
  description?: string
  teacherName?: string
  duration?: number
  onClose?: () => void
}

declare global {
  interface Window {
    VdoPlayer: any
    vdo: any
  }
}

export default function VdoCipherPlayer({
  videoId,
  title = 'Vídeo Explicativo',
  description,
  teacherName,
  duration,
  onClose
}: VdoCipherPlayerProps) {
  const [loading, setLoading] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [otp, setOtp] = useState<string>('')
  const [playbackInfo, setPlaybackInfo] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  // Format duration from seconds to readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`
    }
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }

  // Fetch OTP when player is opened
  const fetchOTP = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.request('/videos/get-otp', {
        method: 'POST',
        body: JSON.stringify({ videoId })
      })
      
      if (response.otp && response.playbackInfo) {
        setOtp(response.otp)
        setPlaybackInfo(response.playbackInfo)
        return true
      } else {
        throw new Error('Failed to get video credentials')
      }
    } catch (err) {
      console.error('Error fetching OTP:', err)
      setError('Não foi possível carregar o vídeo. Por favor, tente novamente.')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Initialize player when OTP is ready
  useEffect(() => {
    if (showPlayer && otp && playbackInfo && containerRef.current) {
      // Load VdoCipher script if not already loaded
      if (!window.VdoPlayer) {
        const script = document.createElement('script')
        script.src = 'https://player.vdocipher.com/v2/api.js'
        script.async = true
        script.onload = () => {
          initializePlayer()
        }
        document.body.appendChild(script)
      } else {
        initializePlayer()
      }
    }

    return () => {
      // Cleanup player
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [showPlayer, otp, playbackInfo])

  const initializePlayer = () => {
    if (!containerRef.current || !window.VdoPlayer) return

    try {
      // Create player instance
      playerRef.current = new window.VdoPlayer({
        otp: otp,
        playbackInfo: playbackInfo,
        theme: '9ae8bbe8dd964ddc9bdb932cca1cb59a',
        container: containerRef.current,
      })

      // Add event listeners
      playerRef.current.addEventListener('load', () => {
        setLoading(false)
      })

      playerRef.current.addEventListener('error', (error: any) => {
        console.error('Player error:', error)
        setError('Erro ao reproduzir o vídeo')
      })
    } catch (err) {
      console.error('Error initializing player:', err)
      setError('Erro ao inicializar o player')
    }
  }

  const handlePlayClick = async () => {
    setShowPlayer(true)
    await fetchOTP()
  }

  if (!showPlayer) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{title}</h3>
                {teacherName && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-white/80" />
                    <p className="text-white/80 text-sm">Professor {teacherName}</p>
                  </div>
                )}
              </div>
            </div>
            {duration && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video Thumbnail/Play Button */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="group relative"
            >
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25 scale-150" />
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25 scale-125" style={{ animationDelay: '200ms' }} />
              
              {/* Play button */}
              <div className="relative bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-8 shadow-2xl transform transition-all group-hover:scale-110 group-hover:shadow-red-500/50">
                <Play className="w-12 h-12 text-white ml-1" fill="white" />
              </div>
            </button>
          </div>
          
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />
        </div>

        {/* Description */}
        {description && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-t border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="bg-black/80 px-6 py-3 flex items-center justify-center">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Clique para assistir a explicação completa
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl max-w-6xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{title}</h3>
                {teacherName && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-white/80" />
                    <p className="text-white/80 text-sm">Professor {teacherName}</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShowPlayer(false)
                if (onClose) onClose()
              }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-red-500" />
                <p className="text-white text-lg">Carregando vídeo...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="flex flex-col items-center gap-4">
                <Film className="w-12 h-12 text-red-500" />
                <p className="text-white text-lg">Erro ao carregar vídeo</p>
                <p className="text-gray-400 text-sm">{error}</p>
                <button
                  onClick={fetchOTP}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
          
          {/* VdoCipher Player Container */}
          <div 
            ref={containerRef}
            className="w-full h-full"
            id="vdo-player-container"
          />
        </div>

        {/* Description */}
        {description && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-t border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300" style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  )
}