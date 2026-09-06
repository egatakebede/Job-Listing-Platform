import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import api from '@/lib/api'

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const Sidebar = user?.role === 'employer' ? EmployerSidebar : EmployeeSidebar

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) =>
      api.put('/profile/password', data),
    onSuccess: () => {
      toast.success(t('settings.passwordUpdated'))
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwError('')
    },
    onError: (error: any) => {
      const msg = error.response?.data?.errors?.current_password?.[0] ?? error.response?.data?.message ?? 'Failed to update password'
      setPwError(msg); toast.error(msg)
    },
  })

  const handlePasswordSave = () => {
    setPwError('')
    if (!currentPassword || !newPassword || !confirmPassword) { setPwError(t('settings.allFieldsRequired')); return }
    if (newPassword.length < 8) { setPwError(t('settings.passwordMinLength')); return }
    if (newPassword !== confirmPassword) { setPwError(t('settings.passwordsNoMatch')); return }
    passwordMutation.mutate({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword })
  }

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('settings.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 max-w-2xl w-full space-y-5">

          <section className="bg-background border rounded-lg p-5 space-y-4">
            <h2 className="font-semibold">{t('settings.account')}</h2>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role_label ?? user?.role ?? '—'}</p>
              </div>
            </div>
          </section>

          <section className="bg-background border rounded-lg p-5 space-y-4">
            <h2 className="font-semibold">{t('settings.changePassword')}</h2>
            <div className="space-y-3">
              <PasswordField label={t('settings.currentPassword')} value={currentPassword} onChange={setCurrentPassword} />
              <PasswordField label={t('settings.newPassword')} value={newPassword} onChange={setNewPassword} />
              <PasswordField label={t('settings.confirmNewPassword')} value={confirmPassword} onChange={setConfirmPassword} />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            <div className="flex justify-end">
              <button onClick={handlePasswordSave} disabled={passwordMutation.isPending} className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {passwordMutation.isPending ? t('settings.saving') : t('settings.updatePassword')}
              </button>
            </div>
          </section>

          <section className="bg-background border rounded-lg p-5 space-y-4">
            <h2 className="font-semibold">{t('settings.appearance')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.theme')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.themeDesc')}</p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className="bg-background border rounded-lg p-5 space-y-4">
            <h2 className="font-semibold">{t('settings.language')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.displayLanguage')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
