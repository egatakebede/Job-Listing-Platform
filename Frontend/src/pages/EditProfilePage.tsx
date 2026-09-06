import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import type { WorkExperience, Education, Language } from '@/stores/profile'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

function uid() { return Math.random().toString(36).slice(2) }

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile, setProfile } = useProfileStore()

  const [headline, setHeadline] = useState(profile.headline)
  const [phone, setPhone] = useState(profile.phone)
  const [location, setLocation] = useState(profile.location)
  const [bio, setBio] = useState(profile.bio)
  const [skills, setSkills] = useState<string[]>(profile.skills)
  const [newSkill, setNewSkill] = useState('')
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [experience, setExperience] = useState<WorkExperience[]>(profile.experience)
  const [education, setEducation] = useState<Education[]>(profile.education)
  const [languages, setLanguages] = useState<Language[]>(profile.languages)

  const handleSave = () => {
    setProfile({ headline, phone, location, bio, skills, experience, education, languages })
    toast.success(t('editProfile.profileSaved'))
    navigate('/my-profile')
  }

  const addSkill = () => {
    const s = newSkill.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setNewSkill(''); setShowSkillInput(false)
  }

  const addExperience = () => setExperience([...experience, { id: uid(), title: '', company: '', period: '' }])
  const updateExp = (id: string, field: keyof WorkExperience, value: string) =>
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  const removeExp = (id: string) => setExperience(experience.filter((e) => e.id !== id))

  const addEducation = () => setEducation([...education, { id: uid(), degree: '', institution: '', year: '' }])
  const updateEdu = (id: string, field: keyof Education, value: string) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  const removeEdu = (id: string) => setEducation(education.filter((e) => e.id !== id))

  const addLanguage = () => setLanguages([...languages, { id: uid(), name: '', level: 'Conversational' }])
  const updateLang = (id: string, field: keyof Language, value: string) =>
    setLanguages(languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)))
  const removeLang = (id: string) => setLanguages(languages.filter((l) => l.id !== id))

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500'
  const sectionCls = 'bg-background border rounded-lg p-5 space-y-4'

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('editProfile.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-3xl w-full">

          <section className={sectionCls}>
            <h2 className="font-semibold">{t('editProfile.personalInfo')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">{t('editProfile.fullName')}</label>
                <input value={user?.name ?? ''} disabled className={`${inputCls} bg-muted/50 text-muted-foreground cursor-not-allowed`} />
                <p className="text-xs text-muted-foreground mt-1">{t('editProfile.nameManaged')}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">{t('auth.email')}</label>
                <input value={user?.email ?? ''} disabled className={`${inputCls} bg-muted/50 text-muted-foreground cursor-not-allowed`} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">{t('editProfile.professionalHeadline')}</label>
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={t('editProfile.headlinePlaceholder')} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">{t('editProfile.phone')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('editProfile.phonePlaceholder')} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium block mb-1">{t('editProfile.location')}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('editProfile.locationPlaceholder')} className={inputCls} />
              </div>
            </div>
          </section>

          <section className={sectionCls}>
            <h2 className="font-semibold">{t('editProfile.aboutBio')}</h2>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder={t('editProfile.bioPlaceholder')} className={`${inputCls} resize-none`} />
          </section>

          <section className={sectionCls}>
            <h2 className="font-semibold">{t('editProfile.skills')}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {skill}
                  <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
              {showSkillInput ? (
                <input
                  autoFocus value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } if (e.key === 'Escape') { setNewSkill(''); setShowSkillInput(false) } }}
                  onBlur={addSkill} placeholder={t('editProfile.skillPlaceholder')}
                  className="w-32 px-3 py-1 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button onClick={() => setShowSkillInput(true)} className="inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-dashed border-blue-400 text-blue-600 rounded-full hover:bg-blue-50">
                  <Plus className="h-3.5 w-3.5" /> {t('editProfile.addSkill')}
                </button>
              )}
            </div>
          </section>

          <section className={sectionCls}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('editProfile.workExperience')}</h2>
              <button onClick={addExperience} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Plus className="h-4 w-4" /> {t('common.add')}</button>
            </div>
            {experience.length === 0 && <p className="text-sm text-muted-foreground italic">{t('editProfile.noExperience')}</p>}
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="border rounded-md p-4 space-y-3 relative">
                  <button onClick={() => removeExp(exp.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className="text-xs font-medium block mb-1">{t('editProfile.jobTitle')}</label>
                      <input value={exp.title} onChange={(e) => updateExp(exp.id, 'title', e.target.value)} placeholder={t('editProfile.jobTitlePlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">{t('editProfile.company')}</label>
                      <input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder={t('editProfile.companyPlaceholder')} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium block mb-1">{t('editProfile.period')}</label>
                      <input value={exp.period} onChange={(e) => updateExp(exp.id, 'period', e.target.value)} placeholder={t('editProfile.periodPlaceholder')} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionCls}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('editProfile.education')}</h2>
              <button onClick={addEducation} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Plus className="h-4 w-4" /> {t('common.add')}</button>
            </div>
            {education.length === 0 && <p className="text-sm text-muted-foreground italic">{t('editProfile.noEducation')}</p>}
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border rounded-md p-4 space-y-3 relative">
                  <button onClick={() => removeEdu(edu.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className="text-xs font-medium block mb-1">{t('editProfile.degreeCertificate')}</label>
                      <input value={edu.degree} onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)} placeholder={t('editProfile.degreePlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">{t('editProfile.institution')}</label>
                      <input value={edu.institution} onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)} placeholder={t('editProfile.institutionPlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">{t('editProfile.year')}</label>
                      <input value={edu.year} onChange={(e) => updateEdu(edu.id, 'year', e.target.value)} placeholder={t('editProfile.yearPlaceholder')} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionCls}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('editProfile.languages')}</h2>
              <button onClick={addLanguage} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Plus className="h-4 w-4" /> {t('common.add')}</button>
            </div>
            {languages.length === 0 && <p className="text-sm text-muted-foreground italic">{t('editProfile.noLanguages')}</p>}
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-3">
                  <input value={lang.name} onChange={(e) => updateLang(lang.id, 'name', e.target.value)} placeholder={t('editProfile.languagePlaceholder')} className={`${inputCls} flex-1`} />
                  <select value={lang.level} onChange={(e) => updateLang(lang.id, 'level', e.target.value)} className={`${inputCls} w-40`}>
                    {['Native', 'Fluent', 'Advanced', 'Intermediate', 'Conversational', 'Basic'].map((l) => (<option key={l}>{l}</option>))}
                  </select>
                  <button onClick={() => removeLang(lang.id)} className="text-muted-foreground hover:text-red-600 flex-shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pb-8">
            <button onClick={() => navigate('/my-profile')} className="px-5 py-2 text-sm font-medium rounded-md border hover:bg-muted">{t('common.cancel')}</button>
            <button onClick={handleSave} className="px-5 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">{t('common.saveChanges')}</button>
          </div>
        </main>
      </div>
    </div>
  )
}
