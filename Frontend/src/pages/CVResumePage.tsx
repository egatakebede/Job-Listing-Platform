import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FileText, UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

const MAX_SIZE_MB = 2

interface CvStatus {
  has_cv: boolean; file_name: string | null; cv_uploaded_at: string | null; file_size: number | null
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default function CVResumePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorTitle, setErrorTitle] = useState('')
  const [errorHint, setErrorHint] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const { data: cvStatus, isLoading } = useQuery({
    queryKey: ['cv-status'],
    queryFn: async () => {
      const res = await api.get('/users/cv/status')
      return res.data.data as CvStatus
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('cv', file)
      return api.post('/users/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      setUploadState('success')
      queryClient.invalidateQueries({ queryKey: ['cv-status'] })
      toast.success(t('cv.uploadSuccess'))
    },
    onError: (error: any) => {
      setUploadState('error')
      const msg = error.response?.data?.errors?.cv?.[0] ?? error.response?.data?.message ?? 'Upload failed'
      setErrorTitle(msg); setErrorHint(t('common.refresh')); toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('/users/cv'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cv-status'] }); toast.success(t('cv.deleted')) },
    onError: () => toast.error(t('cv.deleteFailed')),
  })

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadState('error'); setErrorTitle(t('cv.onlyPdf')); setErrorHint(t('cv.pdfHint')); return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadState('error'); setErrorTitle(t('cv.fileTooLarge')); setErrorHint(t('cv.compressHint')); return
    }
    setUploadState('uploading'); uploadMutation.mutate(file)
  }

  const handleView = async () => {
    const res = await api.get('/users/cv/download', { responseType: 'blob' })
    window.open(URL.createObjectURL(res.data), '_blank')
  }

  const handleDownload = async () => {
    const res = await api.get('/users/cv/download', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = cvStatus?.file_name ?? 'cv.pdf'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('cv.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 max-w-2xl w-full space-y-6">
          {isLoading ? (
            <div className="bg-background border rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-14 bg-muted rounded" />
            </div>
          ) : cvStatus?.has_cv ? (
            <div className="bg-background border rounded-lg p-6">
              <h2 className="font-semibold text-base mb-4">{t('cv.activeCV')}</h2>
              <div className="flex items-center justify-between gap-3 bg-muted/40 border rounded-md p-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cvStatus.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cvStatus.cv_uploaded_at ? `${t('cv.uploaded')} ${new Date(cvStatus.cv_uploaded_at).toLocaleDateString()}` : ''}
                      {cvStatus.file_size ? ` • ${formatSize(cvStatus.file_size)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleView} className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted">{t('common.view')}</button>
                  <button onClick={handleDownload} className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted">{t('common.download')}</button>
                  <button onClick={() => window.confirm(t('cv.deleteConfirm')) && deleteMutation.mutate()} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]) }}
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-blue-400 hover:border-blue-600 hover:bg-blue-50/40'}`}
          >
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <UploadCloud className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-semibold">{t('cv.dragDrop')}</p>
            <p className="text-sm text-muted-foreground">{t('cv.orBrowse')}</p>
            <p className="text-xs text-muted-foreground mt-3">{t('cv.supportedFormat')}</p>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" data-testid="cv-input"
              onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }} />
          </div>

          {uploadState === 'uploading' && (
            <div className="bg-background border rounded-lg p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold">{t('cv.uploading')}</p>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="border border-green-300 bg-green-50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-700">{t('cv.uploadSuccess')}</p>
                <p className="text-xs text-green-600">{t('cv.uploadSuccessDesc')}</p>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="border border-red-300 bg-red-50 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700">{errorTitle}</p>
                <p className="text-xs text-red-600">{errorHint}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
