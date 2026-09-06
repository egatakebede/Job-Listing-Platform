import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Briefcase, MapPin, Mail, Phone, GraduationCap, Globe } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

export default function MyProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile } = useProfileStore()

  const filledFields = [
    profile.headline, profile.phone, profile.location, profile.bio,
    profile.skills.length > 0, profile.experience.length > 0,
    profile.education.length > 0, profile.languages.length > 0,
  ].filter(Boolean).length
  const completion = Math.round((filledFields / 8) * 100)

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('profile.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-background border rounded-lg p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user?.name ?? 'Your Name'}</h2>
                  {profile.headline
                    ? <p className="text-sm text-blue-600 font-medium">{profile.headline}</p>
                    : <p className="text-sm text-muted-foreground italic">{t('profile.addHeadline')}</p>
                  }
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>}
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user?.email}</span>
                    {profile.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/edit-profile')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md flex-shrink-0"
              >
                {t('profile.editProfile')}
              </button>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold mb-2">{t('profile.about')}</h3>
              {profile.bio
                ? <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.bio}</p>
                : <p className="text-sm text-muted-foreground italic">{t('profile.noBio')} <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.addOne')}</button></p>
              }
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold mb-4">{t('profile.workExperience')}</h3>
              {profile.experience.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('profile.noExperience')} <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.addExperience')}</button></p>
              ) : (
                <div className="space-y-4">
                  {profile.experience.map((job, i) => (
                    <div key={job.id} className={`flex items-start gap-3 ${i !== profile.experience.length - 1 ? 'pb-4 border-b' : ''}`}>
                      <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <p className="text-xs text-muted-foreground">{job.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold mb-4">{t('profile.education')}</h3>
              {profile.education.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('profile.noEducation')} <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.addEducation')}</button></p>
              ) : (
                <div className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <div key={edu.id} className={`flex items-start gap-3 ${i !== profile.education.length - 1 ? 'pb-4 border-b' : ''}`}>
                      <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-background border rounded-lg p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">{t('profile.profileCompletion')}</h3>
                <span className="text-blue-600 text-sm font-semibold">{completion}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${completion}%` }} />
              </div>
              {completion < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.completeProfile')}</button> {t('profile.toStandOut')}
                </p>
              )}
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold text-sm mb-3">{t('profile.skills')}</h3>
              {profile.skills.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">{t('profile.noSkills')} <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.addSkills')}</button></p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold text-sm mb-3">{t('profile.languages')}</h3>
              {profile.languages.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">{t('profile.noLanguages')} <button onClick={() => navigate('/edit-profile')} className="text-blue-600 hover:underline">{t('profile.addLanguages')}</button></p>
              ) : (
                <div className="space-y-2">
                  {profile.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium"><Globe className="h-3.5 w-3.5 text-muted-foreground" />{lang.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{lang.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
