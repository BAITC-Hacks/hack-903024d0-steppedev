import { CalendarDays, ChevronDown, FlaskConical } from 'lucide-react'
import { scenarios } from '../../data/mockForecast'
import { useOperations } from '../../state/OperationsContext'
import type { Scenario } from '../../types/forecast'
import { dateLabel } from '../../lib/utils'
export function PageHeading({ title, description }: { title: string; description: string }) {
  const { scenario, changeScenario, busy, forecast } = useOperations()
  const operatingDate = forecast?.records[0].timestamp || '2026-09-23T14:00:00Z'
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="status-dot text-emerald-300" />
          {scenario === 'replay' ? 'HISTORICAL OPERATIONS' : 'LIVE OPERATIONS'}
          <span className="eyebrow-separator">/</span>
          <span className="text-[#6b7a85]">DEMO ENVIRONMENT</span>
        </div>
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-tools">
        <div className="date-chip">
          <CalendarDays size={13} />
          {dateLabel(operatingDate)} {new Date(operatingDate).getUTCFullYear()}
          <span className="text-[#50606b]">UTC</span>
        </div>
        <div className="scenario-select">
          <FlaskConical size={13} />
          <div>
            <label htmlFor="demo-scenario">DEMO SCENARIO</label>
            <select
              id="demo-scenario"
              value={scenario}
              disabled={busy}
              onChange={(e) => void changeScenario(e.target.value as Scenario)}
            >
              {scenarios.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={12} />
        </div>
      </div>
    </div>
  )
}
