'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import SubscriptionRequiredModal from '@/components/SubscriptionRequiredModal'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import apiClient from '@/lib/api'
import {
  FileDown,
  Download,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface Material {
  id: number
  title: string
  description?: string
  file_name: string
  file_size: number
  download_count?: number
  created_at: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MaterialsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { gate, handleError, clearGate } = useFeatureGate()

  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiClient.getMaterials()
      setMaterials(res.data?.materials || [])
    } catch (err: any) {
      if (handleError(err)) return
      setError(err?.message || 'Erro ao carregar materiais. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaterials()
    }
  }, [isAuthenticated, fetchMaterials])

  const handleDownload = async (material: Material) => {
    setDownloadingId(material.id)
    try {
      const blob = await apiClient.downloadMaterial(material.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = material.file_name
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      if (handleError(err)) return
      alert(err?.message || 'Erro ao baixar arquivo. Tente novamente.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (gate) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <SubscriptionRequiredModal
          open
          onClose={() => { clearGate(); router.push('/auth/account') }}
          reason={gate.reason}
          currentPlan={gate.currentPlan}
          feature={gate.feature || 'access_materials'}
        />
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />
      <Breadcrumbs />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Conteudo Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Materiais para Download
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              PDFs de estudo, apostilas e resumos para turbinar sua preparacao.
            </p>
          </div>

          {(authLoading || loading) && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="mt-6 h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="max-w-lg mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Nao foi possivel carregar os materiais
                </h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchMaterials}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {!loading && !error && materials.length === 0 && (
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Materiais em breve
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Estamos preparando materiais de estudo exclusivos. Volte em breve
                para conferir as novidades.
              </p>
            </div>
          )}

          {!loading && !error && materials.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 p-6"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <FileDown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      PDF
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(material.file_size)}
                    </span>
                    {material.download_count != null && material.download_count > 0 && (
                      <span className="text-xs text-gray-400">
                        {material.download_count} download{material.download_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownload(material)}
                    disabled={downloadingId === material.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    aria-label={`Baixar ${material.title}`}
                  >
                    {downloadingId === material.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
