'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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

interface UseMaterialsResult {
  materials: Material[]
  pagination: PaginationData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMaterials(
  page: number,
  limit: number,
  enabled: boolean,
  onGateError: (err: any) => boolean,
): UseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const gateRef = useRef(onGateError)
  gateRef.current = onGateError

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiClient.getMaterials({ page, limit })
      const raw = res.data?.materials || []
      setMaterials(raw.map((m: any) => ({
        ...m,
        category: extractCategory(m.file_name || m.title || ''),
      })))
      setPagination(res.data?.pagination || null)
    } catch (err: any) {
      if (gateRef.current(err)) return
      setError(err?.message || 'Erro ao carregar materiais.')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    if (enabled) fetchMaterials()
  }, [enabled, fetchMaterials])

  return { materials, pagination, loading, error, refetch: fetchMaterials }
}
