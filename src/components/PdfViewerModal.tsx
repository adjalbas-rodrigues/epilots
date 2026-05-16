'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Download, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import apiClient from '@/lib/api'

interface PdfViewerModalProps {
  open: boolean
  onClose: () => void
  materialId: number
  title: string
  fileName: string
}

export default function PdfViewerModal({
  open,
  onClose,
  materialId,
  title,
  fileName,
}: PdfViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const fetchPdf = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const blob = await apiClient.downloadMaterial(materialId)
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)
    } catch {
      setError('Nao foi possivel carregar o PDF. Verifique sua conexao e tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [materialId])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      fetchPdf()
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
    }
    return () => {
      document.body.style.overflow = ''
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
      }
    }
  }, [open, fetchPdf])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const handleClose = useCallback(() => {
    onClose()
    requestAnimationFrame(() => {
      previousFocusRef.current?.focus()
    })
  }, [onClose])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const blob = await apiClient.downloadMaterial(materialId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch {
      /* download error is non-critical — user can retry */
    } finally {
      setDownloading(false)
    }
  }, [materialId, fileName])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && modalRef.current) {
      modalRef.current.requestFullscreen().catch(() => {
        /* fullscreen not supported / denied */
      })
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizar: ${title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 flex flex-col w-[calc(100vw-32px)] h-[calc(100vh-32px)] max-w-[1400px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2
              className="text-base font-bold text-gray-900 truncate leading-tight font-['Lato',sans-serif] tracking-[-0.01em]"
              title={title}
            >
              {title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{fileName}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                bg-gray-900 text-white
                hover:bg-gray-800
                active:bg-gray-950
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150"
              aria-label={`Baixar ${fileName}`}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Baixar</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                text-gray-500 hover:text-gray-700 hover:bg-gray-100
                active:bg-gray-200
                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                transition-colors duration-150"
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                text-gray-500 hover:text-gray-700 hover:bg-gray-100
                active:bg-gray-200
                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                transition-colors duration-150"
              aria-label="Fechar visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50">
              <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Carregando documento...</p>
            </div>
          )}

          {!loading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 px-8">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-base font-bold text-gray-900 mb-1 font-['Lato',sans-serif]">
                  Erro ao carregar o PDF
                </h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                    bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                    transition-colors duration-150"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={`PDF: ${title}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
