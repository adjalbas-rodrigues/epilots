'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import apiClient from '@/lib/api'

export interface Material {
  id: number
  title: string
  description?: string
  file_name: string
  file_size: number
  category: string
  download_count?: number
  created_at: string
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryCount {
  category: string
  count: number
}

interface UseMaterialsResult {
  materials: Material[]
  pagination: PaginationData | null
  categories: CategoryCount[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMaterials(
  page: number,
  limit: number,
  search: string,
  category: string,
  enabled: boolean,
  onGateError: (err: any) => boolean,
): UseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const gateRef = useRef(onGateError)
  gateRef.current = onGateError

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      if (category) params.category = category
      const res: any = await apiClient.getMaterials(params)
      setMaterials(res.data?.materials || [])
      setPagination(res.data?.pagination || null)
      setCategories(res.data?.categories || [])
    } catch (err: any) {
      if (gateRef.current(err)) return
      setError(err?.message || 'Erro ao carregar materiais.')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, category])

  useEffect(() => {
    if (enabled) fetchMaterials()
  }, [enabled, fetchMaterials])

  return { materials, pagination, categories, loading, error, refetch: fetchMaterials }
}
