import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MyProfilePage from './MyProfilePage'

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: vi.fn(),
  }),
}))

describe('MyProfilePage', () => {
  it('renders the My Profile heading', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MyProfilePage />
        </BrowserRouter>
      </QueryClientProvider>
    )
    expect(screen.getByRole('heading', { name: 'My Profile' })).toBeInTheDocument()
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
  })
})