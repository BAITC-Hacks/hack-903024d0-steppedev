import { CircleCheck, Database, Gauge, Info, Layers3, Server, ShieldCheck } from 'lucide-react'
import { useOperations } from '../state/OperationsContext'
import { Badge, Panel, PanelHeading } from '../components/ui/shared'
import { ForecastConfidence } from '../components/confidence/ForecastConfidence'
export default function Diagnostics() {
  const { scenario, forecast } = useOperations()
  const sections = [
    {
      title: 'Data sources',
      icon: Server,
      rows: [
        ['Weather API', scenario === 'api-failure' ? 'Backup connected' : 'Connected'],
        ['Historical Weather Archive', 'Connected'],
        ['Turbine Dataset', 'Loaded'],
        ['Environment', 'Simulated data services'],
      ],
    },
    {
      title: 'Model',
      icon: Layers3,
      rows: [
        ['Model version', 'v1.4'],
        ['Model type', 'Gradient Boosting'],
        ['Forecast horizon', '48 hours'],
        ['Last validation', 'Passed · example'],
      ],
    },
    {
      title: 'Dataset',
      icon: Database,
      rows: [
        ['WT-01', '142k+ records'],
        ['WT-02', '149k+ records'],
        ['Resolution', '10 minutes'],
        ['Training range', 'Mar 2023 – Jan 2026'],
      ],
    },
  ]
  return (
    <div className="space-y-5">
      <div className="info-banner">
        <Info size={17} />
        <p>
          <b>Technical workspace.</b> Configuration, dataset sizes, and model validation below are
          illustrative demo values. No live model metrics have been calculated.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {sections.map((s) => (
          <Panel key={s.title}>
            <PanelHeading title={s.title} icon={<s.icon size={16} className="text-sky-300" />} />
            <div className="space-y-5 px-5 pb-6">
              {s.rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 text-xs">
                  <span className="text-muted">{label}</span>
                  <span className={['Connected', 'Loaded'].includes(value) ? 'text-emerald-300' : ''}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <Panel>
        <PanelHeading
          title="Validation metrics"
          subtitle="Demo metrics / validation example"
          icon={<Gauge size={16} className="text-sky-300" />}
          action={<Badge tone="amber">EXAMPLE VALUES</Badge>}
        />
        <div className="grid gap-5 px-5 pb-6 md:grid-cols-3">
          {[
            {
              name: 'Mean absolute error',
              value: '4.2',
              unit: 'pp',
              detail: 'MAE · normalized power percentage points',
            },
            {
              name: 'Root mean squared error',
              value: '6.1',
              unit: 'pp',
              detail: 'RMSE · normalized power percentage points',
            },
            {
              name: 'Expected range coverage',
              value: '89.6',
              unit: '%',
              detail: 'Example coverage of the nominal 90% interval',
            },
          ].map((m) => (
            <div key={m.name} className="rounded-xl border border-white/5 bg-white/[.015] p-5">
              <p className="text-xs text-muted">{m.name}</p>
              <p className="my-4 text-4xl font-medium">
                {m.value}
                <span className="ml-2 text-base text-muted">{m.unit}</span>
              </p>
              <p className="text-[10px] text-muted">{m.detail}</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeading
            title="Forecast confidence"
            subtitle="Operator-facing system health indicator"
            icon={<ShieldCheck size={16} />}
          />
          <div className="px-5 pb-6">
            {forecast && <ForecastConfidence score={forecast.confidence} factors={forecast.factors} />}
            <p className="mt-5 text-xs leading-6 text-muted">
              Combines weather data completeness, source availability, agreement between sources, model
              uncertainty, turbine consistency, and data freshness. It does not represent the probability that
              a prediction is true.
            </p>
          </div>
        </Panel>
        <Panel>
          <PanelHeading
            title="Integration readiness"
            subtitle="Service contracts prepared for the forecasting backend"
          />
          <div className="space-y-3 px-5 pb-6 text-xs text-muted">
            {[
              'Typed forecast, weather, and turbine contracts',
              'Separate agent status and event history services',
              'Historical replay request and provenance response',
              'Scenario fixtures isolated from presentation components',
            ].map((t) => (
              <p key={t} className="flex items-center gap-2">
                <CircleCheck size={13} className="text-emerald-300" />
                {t}
              </p>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
