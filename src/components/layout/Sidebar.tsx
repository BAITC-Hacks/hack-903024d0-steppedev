import {
  Activity,
  ArrowUpRight,
  AudioLines,
  Bot,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  Radio,
  Wind,
  X,
} from 'lucide-react'
import { useOperations } from '../../state/OperationsContext'
import type { Page } from '../../types/forecast'
import { Dialog } from '../ui/dialog'
import { useState } from 'react'
export const navigation = [
  { page: 'overview', label: 'Overview', icon: LayoutDashboard },
  { page: 'forecast', label: '48h Forecast', icon: ChartNoAxesCombined },
  { page: 'twin', label: 'Turbine Twin', icon: Wind },
  { page: 'agent', label: 'AI Agent', icon: Bot },
  { page: 'replay', label: 'Historical Replay', icon: Clock3 },
  { page: 'diagnostics', label: 'Diagnostics', icon: Activity },
] satisfies { page: Page; label: string; icon: typeof Wind }[]
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { page, setPage, scenario } = useOperations()
  const [help, setHelp] = useState(false)
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" onClick={onClose}>
          <div className="brand-mark">
            <AudioLines size={25} strokeWidth={1.6} />
          </div>
          <div>
            <div className="brand-name">
              WindOps<span> AI</span>
            </div>
            <p>Wind Farm Digital Twin</p>
          </div>
        </a>
        <button className="mobile-nav-close" aria-label="Close navigation" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="workspace-label">
          WORKSPACE<span>01</span>
        </div>
        <div className="site-switcher">
          <div className="site-icon">
            <Wind size={18} />
          </div>
          <div>
            <strong>Steppe Wind Farm</strong>
            <p>Akmola Region, KZ</p>
          </div>
          <span className="status-dot text-emerald-300" />
        </div>
        <p className="nav-caption">OPERATIONS</p>
        <nav>
          {navigation.map(({ page: p, label, icon: Icon }) => (
            <a
              key={p}
              href={`#${p}`}
              onClick={() => {
                setPage(p)
                onClose()
              }}
              aria-current={page === p ? 'page' : undefined}
              className={`nav-item ${page === p ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.6} />
              <span>{label}</span>
              {p === 'agent' ? (
                <span className="nav-live">LIVE</span>
              ) : page === p ? (
                <ChevronRight size={13} className="ml-auto" />
              ) : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-medium tracking-[.12em] text-[#8a9b9c]">
              <Radio size={12} />
              SYSTEM HEALTH
            </div>
            <div>
              <span>System</span>
              <span className="text-emerald-300">
                <i className="status-dot" />
                Online
              </span>
            </div>
            <div>
              <span>Weather API</span>
              <span className={scenario === 'api-failure' ? 'text-amber-300' : 'text-emerald-300'}>
                {scenario === 'api-failure' ? 'Backup' : 'Connected'}
              </span>
            </div>
            <div>
              <span>Model version</span>
              <span className="font-mono text-[#b2bdc6]">v1.4</span>
            </div>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={16} />
            Operator guide
            <ArrowUpRight size={13} className="ml-auto" />
          </button>
          <div className="sidebar-footer">
            <div className="avatar">OP</div>
            <div>
              <strong>Operator workspace</strong>
              <p>Demo environment</p>
            </div>
            <span className="status-dot text-emerald-300" />
          </div>
        </div>
      </aside>
      <Dialog
        open={help}
        onOpenChange={setHelp}
        title="Your operator workspace"
        description="Predict. Understand. Act."
      >
        <div className="space-y-5 text-sm leading-relaxed text-muted">
          <p>
            Start with the 48-hour forecast and system confidence. Click a forecast point to understand its
            main drivers.
          </p>
          <p>
            Use <b className="text-white">Demo Scenario</b> to demonstrate a turbine deviation, weather
            update, source recovery, or increased uncertainty. All pages reflect the selected scenario.
          </p>
          <p>
            <b className="text-white">Historical Replay</b> demonstrates forecasting from a selected past
            origin. Demo fixtures and example validation metrics are clearly identified.
          </p>
          <p>All operational timestamps use UTC. This demo does not connect to a live wind farm.</p>
        </div>
      </Dialog>
    </>
  )
}
