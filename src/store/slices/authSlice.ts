import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  name: string
  email: string
  role?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
      
      // Persist token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        // Clear legacy tokens
        localStorage.removeItem('token')
        localStorage.removeItem('student_token')
        localStorage.removeItem('admin_token')
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    setAuthFromStorage: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
  },
})

export const { loginSuccess, logout, setLoading, updateUser, setAuthFromStorage } = authSlice.actions
export default authSlice.reducer