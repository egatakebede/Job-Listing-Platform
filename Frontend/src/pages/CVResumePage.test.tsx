import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import CVResumePage from './CVResumePage'
import api from '@/lib/api'

const translationMap: Record<string, string> = {
  'cv.title': 'CV / Resume',
  'cv.activeCV': 'Active CV / Resume',
  'cv.dragDrop': 'Drag and drop your CV here',
  'cv.orBrowse': 'or click to browse your files',
  'cv.supportedFormat': 'Supported format: PDF (Max 2MB)',
  'cv.uploading': 'Uploading your CV...',
  'cv.uploadSuccess': 'CV uploaded successfully',
  'cv.uploadSuccessDesc': 'Ready to be used for applications',
  'cv.onlyPdf': 'Only PDF files are allowed',
  'cv.fileTooLarge': 'File size exceeds 2MB limit',
  'cv.compressHint': 'Please compress your document',
  'cv.pdfHint': 'Please upload a PDF document',
  'cv.deleteConfirm': 'Delete this CV? This cannot be undone.',
  'cv.deleted': 'CV deleted',
  'cv.deleteFailed': 'Failed to delete CV',
  'cv.uploaded': 'Uploaded',
  'common.view': 'View',
  'common.download': 'Download',
  'common.delete': 'Delete',
  'common.refresh': 'Please refresh the page',
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translationMap[key] ?? key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}))

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/components/employee/EmployeeSidebar', () => ({
  default: () => null,
}))

vi.mock('@/components/employer/EmployerHeader', () => ({
  default: () => null,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'Lidiya Getachew', email: 'lidiya.getachew@gmail.com' },
    logout: vi.fn(),
  }),
}))

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cv-resume']}>
        <CVResumePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CVResumePage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    vi.mocked(api.get).mockResolvedValue({
      data: { data: { has_cv: false, file_name: null, cv_uploaded_at: null, file_size: null } },
    })
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, message: 'CV uploaded successfully' },
    })
    vi.mocked(api.delete).mockResolvedValue({
      data: { success: true, message: 'CV deleted' },
    })
  })

  it('renders the CV header and upload area', () => {
    renderPage()
    expect(screen.getByText('Drag and drop your CV here')).toBeTruthy()
    expect(screen.getByText('Supported format: PDF (Max 2MB)')).toBeTruthy()
  })

  it('rejects non-PDF files', () => {
    renderPage()
    const input = screen.getByTestId('cv-input')
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('Only PDF files are allowed')).toBeTruthy()
  })

  it('rejects PDF files larger than 2MB', () => {
    renderPage()
    const input = screen.getByTestId('cv-input')
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(input, { target: { files: [big] } })
    expect(screen.getByText('File size exceeds 2MB limit')).toBeTruthy()
  })

  it('sends a PDF as FormData without forcing a multipart content-type header', async () => {
    renderPage()
    const input = screen.getByTestId('cv-input')
    const pdf = new File([new Uint8Array(100 * 1024)], 'My_CV.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [pdf] } })

    await waitFor(() => {
      expect(vi.mocked(api.post)).toHaveBeenCalledTimes(1)
    })

    expect(vi.mocked(api.post).mock.calls[0][0]).toBe('/users/cv/upload')
    expect(vi.mocked(api.post).mock.calls[0][1]).toBeInstanceOf(FormData)
    expect(vi.mocked(api.post).mock.calls[0][2]).toMatchObject({
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })
})