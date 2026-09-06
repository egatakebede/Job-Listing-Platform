import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore, type User } from './auth'
import * as apiModule from '@/lib/api'

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}))

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  role: 'employee',
  role_label: 'Employee',
  email_verified_at: '2024-01-01T00:00:00Z',
  cv_path: null,
  cv_original_name: null,
  cv_uploaded_at: null,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should have initial state', () => {
    const store = useAuthStore.getState()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('should login successfully', async () => {
    const store = useAuthStore.getState()
    const mockToken = 'test-token'
    
    vi.mocked(apiModule.default.post).mockResolvedValue({
      data: { data: { user: mockUser, access_token: mockToken } },
    })

    await store.login({ login: 'test@example.com', password: 'password' })
    
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should register successfully', async () => {
    const store = useAuthStore.getState()
    const mockToken = 'test-token'
    
    vi.mocked(apiModule.default.post).mockResolvedValue({
      data: { data: { user: mockUser, access_token: mockToken } },
    })

    const user = await store.register({
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password',
      password_confirmation: 'password',
      role: 'employee',
    })
    
    expect(user).toEqual(mockUser)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
  })

  it('should logout successfully', async () => {
    useAuthStore.setState({ user: mockUser, token: 'test-token', isAuthenticated: true })
    
    vi.mocked(apiModule.default.post).mockResolvedValue({})

    await useAuthStore.getState().logout()
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should check hasRole correctly', () => {
    useAuthStore.setState({ user: mockUser })
    const store = useAuthStore.getState()
    
    expect(store.hasRole('employee')).toBe(true)
    expect(store.hasRole('admin')).toBe(false)
    expect(store.hasRole(['employee', 'admin'])).toBe(true)
  })
})
