import { create } from 'zustand'
import i18n from '@/i18n'

export interface User {
  id: number
  name: string
  email: string
  username: string
  role: UserRole
  role_label: string
  email_verified_at: string | null
  cv_path: string | null
  cv_original_name: string | null
  cv_uploaded_at: string | null
}

export type UserRole = 'employee' | 'employer' | 'admin'

interface LoginRequest {
  login: string
  password: string
}

interface AuthResponse {
  user: User
  access_token: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<User | null>
  initialize: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  setToken: (token: string) => void
}

import api from '@/lib/api'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/login', data)
      const resData = response.data
      const authData: AuthResponse = resData.data ?? resData
      const { user, access_token } = authData
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true, isLoading: false, isInitialized: true })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/logout')
    } finally {
      // Clear auth
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
      
      // Reset theme
      document.documentElement.classList.remove('dark', 'light')
      
      // Reset language
      await i18n.changeLanguage('en')
      localStorage.removeItem('language')
    }
  },

  getProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/profile')
      const resData = response.data
      const userData: User = resData.data ?? resData
      set({ user: userData, isLoading: false })
      return userData
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  initialize: async () => {
    if (get().isInitialized) return
    try {
      if (get().token) {
        await get().getProfile()
      }
      set({ isInitialized: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const user = get().user
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },
}))
