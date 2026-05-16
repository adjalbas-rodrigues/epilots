'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SubscriptionRequiredModal from '@/components/SubscriptionRequiredModal'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useMaterials, type Material } from '@/hooks/useMaterials'
import { getCategoryLabel, getCategoryStyle } from '@/lib/material-categories'
import apiClient from '@/lib/api'
import {
  Search,
  FileText,
  AlertCircle,
  RefreshCw,
  BookOpen,
  X,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from 'lucide-react'

const PER_PAGE = 20

function formatFileSize(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function MaterialsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { gate, handleError, clearGate } = useFeatureGate()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [selected, setSelected] = useState<Material | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login')
  }, [authLoading, isAuthenticated, router])

  // Reset page when filters change
  const prevSearch = useRef(debouncedSearch)
  const prevCategory = useRef(activeCategory)
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch || prevCategory.current !== activeCategory) {
      setPage(1)
      prevSearch.current = debouncedSearch
      prevCategory.current = activeCategory
    }
  }, [debouncedSearch, activeCategory])

  const { materials, pagination, categories, loading, error, refetch } = useMaterials(
    page, PER_PAGE, debouncedSearch, activeCategory, isAuthenticated, handleError
  )

  // Category pills from server counts
  const categoryPills = useMemo(() => {
    return categories
      .filter(c => c.count > 0)
      .sort((a, b) => Number(b.count) - Number(a.count))
      .map(c => ({ key: c.category, label: getCategoryLabel(c.category), count: Number(c.count) }))
  }, [categories])

  // PDF viewer
  useEffect(() => {
    if (!selected) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
      setPdfError(null)
      return
    }
    let cancelled = false
    setPdfLoading(true)
    setPdfError(null)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)

    apiClient.downloadMaterial(selected.id)
      .then(blob => {
        if (cancelled) return
        setPdfUrl(URL.createObjectURL(blob))
      })
      .catch(() => {
        if (cancelled) return
        setPdfError('Erro ao carregar o PDF.')
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false)
      })

    return () => { cancelled = true }
  }, [selected?.id])

  const handleSelect = useCallback((m: Material) => {
    setSelected(m)
    setMobileOpen(true)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!selected) return
    setDownloading(true)
    try {
      const blob = await apiClient.downloadMaterial(selected.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = selected.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {} finally {
      setDownloading(false)
    }
  }, [selected])

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

  const isLoading = authLoading || (loading && materials.length === 0)
  const totalPages = pagination?.totalPages || 0

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />

      <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gray-50">
        {/* ===== SIDEBAR ===== */}
        <aside className={`
          flex flex-col border-r border-gray-200 bg-white
          w-full lg:w-[420px] lg:min-w-[420px] flex-shrink-0
          ${mobileOpen ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="px-4 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Materiais</h1>
              {pagination && (
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {pagination.total} arquivo{pagination.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar material..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {categoryPills.length > 0 && (
            <div className="px-4 py-2.5 border-b border-gray-100 flex gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveCategory('')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  !activeCategory
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categoryPills.map(cat => {
                const active = activeCategory === cat.key
                const s = getCategoryStyle(cat.key)
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(active ? '' : cat.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      active
                        ? `${s.bgColor} ${s.color}`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-gray-50 p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">{error}</p>
                <button
                  onClick={refetch}
                  className="text-sm text-gray-900 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && materials.length === 0 && (
              <div className="p-6 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchInput || activeCategory ? 'Nenhum material encontrado.' : 'Nenhum material disponível.'}
                </p>
                {(searchInput || activeCategory) && (
                  <button
                    onClick={() => { setSearchInput(''); setActiveCategory('') }}
                    className="mt-2 text-xs text-gray-600 hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {!loading && !error && materials.length > 0 && (
              <ul className="py-1">
                {materials.map(m => {
                  const isActive = selected?.id === m.id
                  const s = getCategoryStyle(m.category)
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => handleSelect(m)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-l-3 ${
                          isActive
                            ? 'bg-red-50/60 border-l-red-500'
                            : 'border-l-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <FileDown className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight line-clamp-2 ${
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.bgColor} ${s.color}`}>
                              {getCategoryLabel(m.category)}
                            </span>
                            <span className="text-[11px] text-gray-400">{formatFileSize(m.file_size)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
              <span className="text-[11px] text-gray-500">
                Pág. {pagination!.page} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ===== VIEWER ===== */}
        <main className={`
          flex-1 flex flex-col min-w-0 bg-gray-100
          ${mobileOpen ? 'flex' : 'hidden lg:flex'}
        `}>
          {!selected && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-gray-200/60 flex items-center justify-center mb-5">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-400 mb-1">Selecione um material</h2>
              <p className="text-sm text-gray-400 max-w-xs">
                Escolha um PDF na lista ao lado para visualizar aqui.
              </p>
            </div>
          )}

          {selected && (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 truncate">{selected.title}</h2>
                  <p className="text-[11px] text-gray-400 truncate">{selected.file_name} — {formatFileSize(selected.file_size)}</p>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="hidden sm:inline">Baixar</span>
                </button>
              </div>

              <div className="flex-1 relative">
                {pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500">Carregando PDF...</p>
                  </div>
                )}

                {!pdfLoading && pdfError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 px-8">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-sm text-gray-600">{pdfError}</p>
                    <button
                      onClick={() => setSelected({ ...selected })}
                      className="text-sm font-semibold text-gray-900 hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                    </button>
                  </div>
                )}

                {!pdfLoading && !pdfError && pdfUrl && (
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    title={`PDF: ${selected.title}`}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}
