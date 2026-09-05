import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EditProfilePage from './EditProfilePage'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('EditProfilePage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('renders personal information fields', () => {
    renderPage()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText(/Full Name/)).toBeInTheDocument()
    expect(screen.getByText(/Email Address/)).toBeInTheDocument()
  })

  it('renders skills section', () => {
    renderPage()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})