export default function EmployeeSidebar() { return null }
import { LayoutGrid, User, FileText, ClipboardList, Search, Settings, LogOut, Menu, X, Briefcase } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    { label: t('nav.dashboard'),    icon: LayoutGrid,   path: '/dashboard' },
    { label: t('nav.myProfile'),    icon: User,         path: '/my-profile' },
    { label: t('nav.applications'), icon: FileText,      path: '/my-applications' },
    { label: t('nav.cvResume'),     icon: ClipboardList, path: '/cv-resume' },
    { label: t('nav.jobSearch'),    icon: Search,        path: '/job-search' },
    { label: t('nav.settings'),     icon: Settings,      path: '/settings' },
  ]

  async function handleLogout() {
    setIsLoggingOut(true)
    try { await logout(); navigate('/login', { replace: true }) }
    catch { navigate('/login', { replace: true }) }
    finally { setIsLoggingOut(false); setShowConfirm(false) }
  }

  function go(path: string) { navigate(path); onNavigate?.() }

  return (
    <>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path === '/my-profile' && location.pathname === '/edit-profile')
          return (
            <button
              key={item.label}
              onClick={() => go(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-2 border-t">
        <button
          onClick={() => setShowConfirm(true)}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold">Logout</h2>
                <p className="text-sm text-muted-foreground">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isLoggingOut}>Cancel</Button>
              <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function EmployeeSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-600 p-1">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">HireStream</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-background flex flex-col h-full shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-blue-600 p-1">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">HireStream</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sticky sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 border-r bg-background sticky top-0 h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex h-16 items-center border-b px-3 flex-shrink-0">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2.5 overflow-hidden rounded-md hover:opacity-80 transition-opacity"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className="rounded-md bg-blue-600 p-1.5 flex-shrink-0">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            {!collapsed && <span className="font-semibold text-lg">HireStream</span>}
          </button>
        </div>
        <NavList collapsed={collapsed} />
      </aside>
    </>
  )
}
