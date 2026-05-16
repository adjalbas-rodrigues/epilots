'use client'

import { useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api'
import { extractCategory, type CategoryDefinition } from '@/lib/material-categories'

export interface Material {
  id: number
  title: string
  description?: string
  file_name: string
  file_size: number
  download_count?: number
  created_at: string
  category: CategoryDefinition
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UseMaterialsParams {
  page: number
  limit: number
  enabled: boolean
  onGateError: (err: any) => boolean
}

interface UseMaterialsResult {
  materials: Material[]
  pagination: PaginationData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const ITEMS_PER_PAGE = 20

export function useMaterials({
  page,
  limit = ITEMS_PER_PAGE,
  enabled,
  onGateError,
}: UseMaterialsParams): UseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiClient.getMaterials({ page, limit })
      const rawMaterials = res.data?.materials || []
      const enriched: Material[] = rawMaterials.map((m: any) => ({
        ...m,
        category: extractCategory(m.file_name || m.title || ''),
      }))
      setMaterials(enriched)
      setPagination(res.data?.pagination || null)
    } catch (err: any) {
      if (onGateError(err)) return
      setError(
        err?.message || 'Nao foi possivel carregar os materiais. Verifique sua conexao e tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }, [page, limit, onGateError])

  useEffect(() => {
    if (enabled) {
      fetchMaterials()
    }
  }, [enabled, fetchMaterials])

  return { materials, pagination, loading, error, refetch: fetchMaterials }
}
