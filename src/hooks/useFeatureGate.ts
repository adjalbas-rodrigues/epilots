'use client'

import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api'

export type GateReason = 'SUBSCRIPTION_REQUIRED' | 'FEATURE_NOT_IN_PLAN'

export interface GateState {
  reason: GateReason
  currentPlan?: string
  feature?: string
}

interface UseFeatureGateResult {
  gate: GateState | null
  handleError: (err: any) => boolean
  clearGate: () => void
}

/**
 * Detects 402/403 access-control errors from the API and exposes a gate
 * state to render <SubscriptionRequiredModal>. Returns true from
 * handleError when the error is a gate (so callers can short-circuit).
 */
export function useFeatureGate(): UseFeatureGateResult {
  const [gate, setGate] = useState<GateState | null>(null)

  const handleError = useCallback((err: any): boolean => {
    if (!err) return false
    const code: string | undefined = err.code || err?.data?.code
    if (code === 'SUBSCRIPTION_REQUIRED') {
      setGate({ reason: 'SUBSCRIPTION_REQUIRED' })
      return true
    }
    if (code === 'FEATURE_NOT_IN_PLAN') {
      setGate({
        reason: 'FEATURE_NOT_IN_PLAN',
        currentPlan: err.data?.plan,
        feature: err.data?.required
      })
      return true
    }
    return false
  }, [])

  const clearGate = useCallback(() => setGate(null), [])

  return { gate, handleError, clearGate }
}
