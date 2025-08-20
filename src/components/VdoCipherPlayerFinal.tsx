'use client'

import { useState, useEffect, useRef } from 'react'
import { Film, Play, X, Loader2, Clock, User, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

interface VdoCipherPlayerFinalProps {
  videoId: string
  title?: string
  description?: string
  teacherName?: string
  duration?: number
  thumbnail?: string
  onClose?: () => void
}

export default function VdoCipherPlayerFinal({
  videoId,
  title = 'Vídeo Explicativo',
  description,
  teacherName,
  duration,
  thumbnail,
  onClose
}: VdoCipherPlayerFinalProps) {
  // Decode HTML entities in title
  const decodedTitle = title ? decodeHtmlEntities(title) : 'Vídeo Explicativo'
  const decodedDescription = description ? decodeHtmlEntities(description) : undefined
  const [loading, setLoading] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  const handlePlayClick = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch OTP
      const response = await apiClient.request('/videos/get-otp', {
        method: 'POST',
        body: JSON.stringify({ videoId })
      })
      
      if (response.otp && response.playbackInfo) {
        setShowPlayer(true)
        
        // Small delay to ensure iframe is mounted
        setTimeout(() => {
          if (iframeRef.current) {
            // Build the embed URL with OTP
            const embedUrl = `https://player.vdocipher.com/v2/?otp=${response.otp}&playbackInfo=${response.playbackInfo}&primaryColor=ef4444`
            iframeRef.current.src = embedUrl
          }
        }, 100)
      } else {
        throw new Error('Failed to get video credentials')
      }
    } catch (err) {
      console.error('Error fetching OTP:', err)
      setError('Não foi possível carregar o vídeo. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowPlayer(false)
    if (onClose) onClose()
  }

  if (!showPlayer) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 animate-pulse">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{decodedTitle}</h3>
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
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-black overflow-hidden">
          {/* Thumbnail image if available */}
          {thumbnail && (
            <div className="absolute inset-0">
              <img 
                src={thumbnail} 
                alt={decodedTitle}
                className="w-full h-full object-cover opacity-40"
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          )}
          
          {/* Background pattern (shown when no thumbnail) */}
          {!thumbnail && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              disabled={loading}
              className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="relative bg-gradient-to-r from-gray-600 to-gray-700 rounded-full p-8 shadow-2xl">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              ) : (
                <>
                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25 scale-150" />
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25 scale-125" style={{ animationDelay: '200ms' }} />
                  
                  {/* Play button */}
                  <div className="relative bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-8 shadow-2xl transform transition-all group-hover:scale-110 group-hover:shadow-red-500/50">
                    <Play className="w-12 h-12 text-white ml-1" fill="white" />
                  </div>
                </>
              )}
            </button>
          </div>
          
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />
          
          {/* Video info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white/80 text-sm flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Clique para assistir a explicação completa
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {decodedDescription && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-t border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">{decodedDescription}</p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border-t border-red-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl max-w-6xl w-full animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 animate-pulse">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{decodedTitle}</h3>
                {teacherName && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-white/80" />
                    <p className="text-white/80 text-sm">Professor {teacherName}</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all transform hover:scale-110"
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
                <p className="text-gray-400 text-sm">Preparando reprodução segura...</p>
              </div>
            </div>
          )}
          
          {/* VdoCipher iframe */}
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            style={{ border: 0 }}
            allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Description */}
        {decodedDescription && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-t border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">{decodedDescription}</p>
          </div>
        )}

        {/* Progress Bar decorativa */}
        <div className="h-1 bg-gray-800">
          <div className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Add animation styles
if (typeof document !== 'undefined' && !document.getElementById('vdo-animations')) {
  const style = document.createElement('style')
  style.id = 'vdo-animations'
  style.textContent = `
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes scale-in {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    
    .animate-scale-in {
      animation: scale-in 0.3s ease-out;
    }
  `
  document.head.appendChild(style)
}