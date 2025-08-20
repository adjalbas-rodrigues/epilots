import { Middleware } from '@reduxjs/toolkit'
import apiClient from '@/lib/api'

export const authMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action)

  // Sync token with apiClient when auth state changes
  if (action.type === 'auth/loginSuccess') {
    const token = action.payload?.token
    if (token) {
      apiClient.setToken(token)
    }
  } else if (action.type === 'auth/logout') {
    apiClient.clearToken()
  } else if (action.type === 'persist/REHYDRATE' && action.payload?.auth) {
    // When Redux Persist rehydrates the state, sync the token
    const token = action.payload.auth.token
    if (token) {
      apiClient.setToken(token)
    }
  }

  return result
}