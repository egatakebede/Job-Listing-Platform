import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, CheckCircle2 } from 'lucide-react'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

interface JobDetail {
  id: number; title: string; slug: string; description: string
  requirements: string[]; responsibilities: string[]
  job_type_label: string; experience_level_label: string
  location: string | null; salary_min: number | null; salary_max: number | null
  salary_currency: string; is_remote: boolean; published_at: string | null
  employer: { company_name: string; logo: string | null; website: string | null; location: string | null } | null
  category: { name: string } | null
}

function formatSalary(job: JobDetail, notSpecified: string): string {
  if (!job.salary_min && !job.salary_max) return notSpecified
  if (job.salary_min && job.salary_max)
    return `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
  return `${(job.salary_min ?? job.salary_max)?.toLocaleString()} ${job.salary_currency}`
}

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', slug],
    queryFn: async () => {
      const res = await api.get(`/jobs/${slug}`)
      return (res.data.data ?? res.data) as JobDetail
    },
    enabled: !!slug,
  })

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => api.post(`/jobs/${jobId}/apply`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applications'] }); toast.success(t('jobs.applicationSubmitted')) },
    onError: (error: any) => { toast.error(error.response?.data?.message ?? t('jobs.failedToApply')) },
  })

  const hasApplied = applyMutation.isSuccess

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('jobs.details')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 max-w-3xl w-full space-y-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t('common.back')}
          </button>

          {isLoading && (
            <div className="bg-background border rounded-lg p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-600">{t('jobs.failedToLoadDetails')}</div>
          )}

          {job && (
            <>
              <div className="bg-background border rounded-lg p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">{job.title}</h1>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {job.employer?.company_name ?? t('jobs.unknownCompany')}
                        {job.employer?.location ? ` • ${job.employer.location}` : ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded-full bg-muted">{job.job_type_label}</span>
                        <span className="px-2 py-1 rounded-full bg-muted">{job.experience_level_label}</span>
                        {job.is_remote && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">{t('jobs.remote')}</span>}
                        {job.category && <span className="px-2 py-1 rounded-full bg-muted">{job.category.name}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => !hasApplied && applyMutation.mutate(job.id)}
                    disabled={hasApplied || applyMutation.isPending}
                    className={`px-5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap flex items-center gap-2 ${hasApplied ? 'bg-green-50 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}
                  >
                    {hasApplied && <CheckCircle2 className="h-4 w-4" />}
                    {applyMutation.isPending ? t('jobs.applying') : hasApplied ? t('jobs.applied') : t('jobs.applyNow')}
                  </button>
                </div>

                {applyMutation.isError && (
                  <p className="mt-3 text-sm text-red-600">{(applyMutation.error as any)?.response?.data?.message ?? t('jobs.failedToApply')}</p>
                )}

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm border-t pt-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{job.location ?? (job.is_remote ? t('jobs.remote') : t('jobs.salaryNotSpecified'))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>{formatSalary(job, t('jobs.salaryNotSpecified'))}</span>
                  </div>
                  {job.published_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{t('jobs.posted')} {new Date(job.published_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background border rounded-lg p-6 space-y-4">
                <h2 className="font-semibold">{t('jobs.description')}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>

              {job.responsibilities.length > 0 && (
                <div className="bg-background border rounded-lg p-6 space-y-3">
                  <h2 className="font-semibold">{t('jobs.responsibilities')}</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements.length > 0 && (
                <div className="bg-background border rounded-lg p-6 space-y-3">
                  <h2 className="font-semibold">{t('jobs.requirements')}</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.employer && (
                <div className="bg-background border rounded-lg p-6 space-y-3">
                  <h2 className="font-semibold">{t('jobs.aboutCompany')}</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.employer.company_name}</p>
                      {job.employer.location && <p className="text-xs text-muted-foreground">{job.employer.location}</p>}
                      {job.employer.website && (
                        <a href={job.employer.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{job.employer.website}</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
