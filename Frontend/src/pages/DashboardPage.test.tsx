import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './DashboardPage'

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  email_verified_at: '2026-01-01',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    getProfile: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  })),
}))

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <button data-testid="lang-switcher">Lang</button>,
}))

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard header', () => {
    renderPage()
    expect(screen.getByText('Job Listing Platform')).toBeInTheDocument()
  })

  it('renders user name', () => {
    renderPage()
    expect(screen.getByText(/Welcome, John Doe/)).toBeInTheDocument()
  })

  it('renders user info', () => {
    renderPage()
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getByText('@johndoe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders user avatar icon', () => {
    renderPage()
    expect(screen.getByText("Your job listing dashboard")).toBeInTheDocument()
  })
})
