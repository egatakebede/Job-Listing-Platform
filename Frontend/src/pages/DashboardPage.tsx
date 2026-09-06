import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Search, FileText, ClipboardList, Briefcase,
  CheckCircle2, Clock, XCircle, ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

type StatusLabel = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired'

interface Application {
  id: number
  status_label: StatusLabel
  created_at: string
  job_post: {
    title: string
    slug: string
    employer: { company_name: string } | null
    location: string | null
  } | null
}

const statusStyles: Record<StatusLabel, string> = {
  Submitted: 'bg-blue-50 text-blue-600',
  'Under Review': 'bg-amber-50 text-amber-600',
  Shortlisted: 'bg-green-50 text-green-600',
  Rejected: 'bg-red-50 text-red-600',
  Hired: 'bg-purple-50 text-purple-600',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, getProfile } = useAuthStore()

  useEffect(() => {
    if (!user) {
      getProfile().catch(() => navigate('/login'))
    } else if (user.role === 'employer') {
      navigate('/employer-dashboard', { replace: true })
    } else if (user.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, getProfile, navigate])

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/employee/applications')
      return (res.data.data ?? res.data) as Application[]
    },
    enabled: !!user,
  })

  const applications = data ?? []
  const total = applications.length
  const active = applications.filter((a) => a.status_label === 'Submitted' || a.status_label === 'Under Review').length
  const shortlisted = applications.filter((a) => a.status_label === 'Shortlisted' || a.status_label === 'Hired').length
  const rejected = applications.filter((a) => a.status_label === 'Rejected').length
  const recent = applications.slice(0, 4)

  const stats = [
    { label: t('dashboard.totalApplied'), value: total, icon: Briefcase, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: t('dashboard.inProgress'), value: active, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: t('dashboard.shortlisted'), value: shortlisted, icon: CheckCircle2, bg: 'bg-green-50', color: 'text-green-600' },
    { label: t('dashboard.rejected'), value: rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
  ]

  const quickLinks = [
    { label: t('dashboard.searchJobs'), icon: Search, path: '/job-search', desc: t('dashboard.searchJobsDesc') },
    { label: t('dashboard.myApplications'), icon: FileText, path: '/my-applications', desc: t('dashboard.myApplicationsDesc') },
    { label: t('dashboard.cvResume'), icon: ClipboardList, path: '/cv-resume', desc: t('dashboard.cvResumeDesc') },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('dashboard.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-5xl w-full">
          <div>
            <h2 className="text-xl font-semibold">{t('dashboard.welcome', { name: user?.name ?? 'there' })}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('dashboard.description')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-background border rounded-lg p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-md ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-tight">
                    {isLoading ? <span className="inline-block h-6 w-8 bg-muted rounded animate-pulse" /> : value}
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map(({ label, icon: Icon, path, desc }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-background border rounded-lg p-4 flex items-center gap-3 hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-left group"
              >
                <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="bg-background border rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">{t('dashboard.recentApplications')}</h3>
              <button
                onClick={() => navigate('/my-applications')}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-9 w-9 rounded-md bg-muted flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('dashboard.noApplications')}{' '}
                <button onClick={() => navigate('/job-search')} className="text-blue-600 hover:underline">
                  {t('dashboard.startSearching')}
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {recent.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 cursor-pointer"
                    onClick={() => app.job_post?.slug && navigate(`/jobs/${app.job_post.slug}`)}
                  >
                    <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.job_post?.title ?? t('applications.unknownPosition')}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.job_post?.employer?.company_name ?? '—'}
                        {app.job_post?.location ? ` • ${app.job_post.location}` : ''}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[app.status_label] ?? 'bg-muted text-muted-foreground'}`}>
                      {app.status_label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
