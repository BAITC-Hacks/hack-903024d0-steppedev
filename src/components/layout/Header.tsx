import { Bell, ChevronRight, Menu, RefreshCw, Settings2, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useOperations } from '../../state/OperationsContext'
import { Button } from '../ui/button'
import { Dialog } from '../ui/dialog'
import { Badge } from '../ui/shared'
import { navigation } from './Sidebar'
export function Header({ onMenu }: { onMenu: () => void }) {
  const { page, agent, scenario, notifications, markRead, busy, refresh, lastUpdate } = useOperations()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('windops-reduced-motion') === 'true')
  const unread = notifications.filter((n) => !n.read).length
  return (
    <>
      <header className="header">
        <div className="header-location">
          <Button
            variant="ghost"
            size="icon"
            className="menu-toggle"
            onClick={onMenu}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </Button>
          <span className="hidden text-[#71808c] xl:inline">Workspace</span>
          <ChevronRight size={12} className="hidden text-[#4a5964] xl:block" />
          <span>{navigation.find((n) => n.page === page)?.label}</span>
        </div>
        <div className="header-feeds">
          <span>
            <i className="status-dot text-emerald-300" />
            System online
          </span>
          <span>
            <i
              className={`status-dot ${scenario === 'api-failure' ? 'text-amber-300' : 'text-emerald-300'}`}
            />
            Weather {scenario === 'api-failure' ? 'backup' : 'online'}
          </span>
          <span className="header-agent">
            <i className="status-dot pulse-dot text-emerald-300" />
            AI Agent {agent.active ? 'active' : 'waiting'}
          </span>
        </div>
        <div className="header-actions">
          <div className="header-updated">
            Last update <b>{lastUpdate}</b>
            <span>48h forecast</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={busy}>
            <RefreshCw size={13} className={busy ? 'animate-spin' : ''} />
            <span className="refresh-label">{busy ? 'Updating…' : 'Refresh Forecast'}</span>
          </Button>
          <button
            className="icon-button notification-button"
            aria-label={`Notifications, ${unread} unread`}
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={17} />
            {unread > 0 && <i />}
          </button>
          <button
            className="icon-button settings-button"
            aria-label="Settings"
            onClick={() => setShowSettings(true)}
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>
      <Dialog
        open={showNotifications}
        onOpenChange={setShowNotifications}
        title="Notification center"
        description={`${unread} unread operational updates`}
        drawer
      >
        <Button variant="outline" size="sm" className="mb-5" onClick={markRead} disabled={unread === 0}>
          Mark all as read
        </Button>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              className={`rounded-xl border p-4 ${n.read ? 'border-white/5 opacity-65' : 'border-white/10 bg-white/[.025]'}`}
              key={n.id}
            >
              <div className="mb-3 flex items-center justify-between">
                <Badge tone={n.severity === 'Critical' ? 'red' : n.severity === 'Warning' ? 'amber' : 'blue'}>
                  {n.severity}
                </Badge>
                <time className="text-[10px] text-muted">{n.time} UTC</time>
              </div>
              <h3 className="text-sm font-medium">{n.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{n.description}</p>
            </div>
          ))}
        </div>
      </Dialog>
      <Dialog
        open={showSettings}
        onOpenChange={setShowSettings}
        title="Workspace settings"
        description="Display preferences for this device."
      >
        <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
          <div>
            <p className="text-sm">Reduce motion</p>
            <p className="mt-1 text-xs text-muted">Pause turbine and status animations.</p>
          </div>
          <input
            aria-label="Reduce motion"
            type="checkbox"
            className="h-4 w-4 accent-emerald-300"
            checked={reduceMotion}
            onChange={(e) => {
              setReduceMotion(e.target.checked)
              localStorage.setItem('windops-reduced-motion', String(e.target.checked))
              document.documentElement.classList.toggle('reduce-motion', e.target.checked)
            }}
          />
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted">
          <SlidersHorizontal size={15} />
          Display timezone: UTC · Normalized power: %
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Demo environment · model v1.4. Service connections can be configured in the API adapter when a
          backend is available.
        </p>
      </Dialog>
    </>
  )
}
