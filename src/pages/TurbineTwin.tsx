import { Bot, CircleCheck, GitCompareArrows, TriangleAlert } from 'lucide-react'
import { useOperations } from '../state/OperationsContext'
import { TurbineCard } from '../components/turbine/TurbineCard'
import { Badge, Panel, PanelHeading } from '../components/ui/shared'
import { ForecastChart } from '../components/charts/ForecastChart'
import { percent } from '../lib/utils'
import { mockDeviationComparison } from '../data/mockTurbines'
export default function TurbineTwin() {
  const { turbines, forecast, anomalies, scenario } = useOperations()
  if (!forecast) return null
  const deviation = scenario === 'deviation'
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {turbines.map((t) => (
          <TurbineCard key={t.id} turbine={t} detailed />
        ))}
      </div>
      <Panel className={deviation ? 'border-amber-300/25' : ''}>
        <PanelHeading
          title="AI Twin Analysis"
          icon={<Bot size={17} className="text-emerald-300" />}
          action={
            <Badge tone={deviation ? 'amber' : 'green'} dot>
              {deviation ? 'OPERATOR ATTENTION' : 'CONSISTENT BEHAVIOUR'}
            </Badge>
          }
        />
        <div className="flex gap-4 px-5 pb-6">
          {deviation ? (
            <TriangleAlert size={23} className="shrink-0 text-amber-300" />
          ) : (
            <CircleCheck size={23} className="shrink-0 text-emerald-300" />
          )}
          <div>
            <h3 className="text-base font-medium">
              {deviation
                ? 'Potential underperformance detected on WT-02.'
                : 'Both turbines are operating within their expected range.'}
            </h3>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
              Both turbines are exposed to similar wind conditions ({turbines[0].wind.toFixed(1)} and{' '}
              {turbines[1].wind.toFixed(1)} m/s). WT-01 behaviour is consistent with historical patterns.{' '}
              {deviation
                ? `WT-02 observed output of ${percent(turbines[1].observed)} differs from the expected ${percent(turbines[1].expected)}. Operator inspection may be required. This deviation alone does not establish a mechanical fault.`
                : 'The small output difference is consistent with normal variation in turbine response. No operator action is required.'}
            </p>
          </div>
        </div>
      </Panel>
      <Panel>
        <PanelHeading
          title="Turbine behaviour comparison"
          subtitle="Expected output under shared environmental conditions"
          icon={<GitCompareArrows size={16} />}
          action={deviation && <Badge tone="amber">WT-02 DEVIATION</Badge>}
        />
        <div className="p-5">
          <ForecastChart
            records={forecast.records.slice(0, 24)}
            observed={deviation ? mockDeviationComparison : undefined}
            height={285}
          />
        </div>
        {deviation && (
          <p className="px-5 pb-5 text-[11px] text-muted">
            Amber line: illustrative continuation of the current observed deviation for comparison. It is not
            a future observation.
          </p>
        )}
      </Panel>
      <Panel>
        <PanelHeading title="Detected deviations" subtitle="Current signals and historical operator events" />
        <div className="divide-y divide-white/5 px-5">
          {anomalies.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 py-5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.active ? 'bg-amber-300/10 text-amber-300' : 'bg-white/5 text-muted'}`}
              >
                <TriangleAlert size={16} />
              </div>
              <div className="min-w-32">
                <p className="text-xs text-muted">
                  {new Date(a.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC',
                  })}
                </p>
                <p className="mt-1 text-sm">{a.turbine}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm">{a.title}</p>
                <p className="mt-1 text-xs text-muted">Duration: {a.duration}</p>
              </div>
              <Badge tone={a.active ? 'amber' : 'gray'}>{a.active ? 'ACTIVE' : 'RESOLVED'}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
