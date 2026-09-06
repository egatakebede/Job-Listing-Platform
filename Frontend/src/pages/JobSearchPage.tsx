import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, Briefcase, MapPin, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

interface JobPost {
  id: number
  title: string
  slug: string
  description: string
  job_type_label: string
  experience_level_label: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  is_remote: boolean
  employer: { company_name: string; logo: string | null } | null
  category: { name: string } | null
}

interface JobsResponse { data: JobPost[]; meta?: { total: number } }

function formatSalary(job: JobPost, notSpecified: string): string {
  if (!job.salary_min && !job.salary_max) return notSpecified
  if (job.salary_min && job.salary_max)
    return `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
  return `${(job.salary_min ?? job.salary_max)?.toLocaleString()} ${job.salary_currency}`
}

export default function JobSearchPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())
  const [applyError, setApplyError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', search, locationFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (locationFilter) params.location = locationFilter
      const res = await api.get('/jobs', { params })
      return res.data.data as JobsResponse
    },
  })

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => api.post(`/jobs/${jobId}/apply`),
    onSuccess: (_res, jobId) => {
      setAppliedIds((prev) => new Set(prev).add(jobId))
      setApplyError(null)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success(t('jobs.applicationSubmitted'))
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message ?? t('jobs.failedToApply')
      setApplyError(msg); toast.error(msg)
    },
  })

  const jobs = data?.data ?? []

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('jobs.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-background border rounded-lg p-4 mb-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('jobs.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative w-full sm:w-56">
              <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder={t('jobs.locationPlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {applyError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{applyError}</div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background border rounded-lg p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-600">{t('jobs.failedToLoad')}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-16">{t('jobs.noJobs')}</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const hasApplied = appliedIds.has(job.id)
                return (
                  <div key={job.id} className="bg-background border rounded-lg p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <button onClick={() => navigate(`/jobs/${job.slug}`)} className="font-semibold text-left hover:text-blue-600 hover:underline">{job.title}</button>
                          <p className="text-sm text-muted-foreground">
                            {job.employer?.company_name ?? t('jobs.unknownCompany')}
                            {job.location ? ` • ${job.location}` : ''}
                            {job.is_remote ? ` • ${t('jobs.remote')}` : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 rounded-full bg-muted">{job.job_type_label}</span>
                            <span className="px-2 py-1 rounded-full bg-muted">{job.experience_level_label}</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatSalary(job, t('jobs.salaryNotSpecified'))}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => !hasApplied && applyMutation.mutate(job.id)}
                        disabled={hasApplied || applyMutation.isPending}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex-shrink-0 ${hasApplied ? 'bg-blue-50 text-blue-600 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}
                      >
                        {applyMutation.isPending && applyMutation.variables === job.id ? t('jobs.applying') : hasApplied ? t('jobs.applied') : t('jobs.applyNow')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
