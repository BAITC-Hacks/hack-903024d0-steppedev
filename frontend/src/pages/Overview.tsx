import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ChevronRight,
  CircleCheck,
  Clock3,
  CloudSun,
  Lightbulb,
  Maximize2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useOperations } from '../state/OperationsContext'
import { Badge, Panel, PanelHeading, TextLink } from '../components/ui/shared'
import { ForecastConfidence } from '../components/confidence/ForecastConfidence'
import { ForecastChart } from '../components/charts/ForecastChart'
import { TurbineCard } from '../components/turbine/TurbineCard'
import { TurbineVisual } from '../components/turbine/TurbineVisual'
import { AgentTimeline } from '../components/agent/AgentTimeline'
import { ForecastExplanation } from '../components/forecast/ForecastExplanation'
import { percent, timeLabel } from '../lib/utils'
import type { ForecastRecord } from '../types/forecast'
import { OperationsStatus } from '../components/agent/OperationsStatus'
export default function Overview() {
  const { forecast, turbines, agent, events, busy, scenario, setPage } = useOperations()
  const [selected, setSelected] = useState<ForecastRecord | null>(null)
  const [hours, setHours] = useState(48)
  if (!forecast) return null
  const average =
    forecast.records.slice(0, 6).reduce((s, r) => s + (r.WT01.prediction + r.WT02.prediction) / 2, 0) / 6
  const peak = forecast.records.reduce((p, r) => (r.WT01.prediction > p.WT01.prediction ? r : p))
  const low = forecast.records.reduce((p, r) => (r.windSpeed120m < p.windSpeed120m ? r : p))
  const rise =
    (average / ((forecast.records[0].WT01.prediction + forecast.records[0].WT02.prediction) / 2) - 1) * 100
  const warning = ['deviation', 'api-failure', 'uncertainty'].includes(scenario)
  return (
    <div className="space-y-5">
      <OperationsStatus />
      <div className="kpi-grid">
        <Panel className="kpi-card">
          <div className="kpi-label">
            <span>Expected generation</span>
            <Zap size={15} />
          </div>
          <div className="kpi-number-row">
            <strong className="metric-value">{percent(average)}</strong>
            <span className="metric-trend">
              <ArrowUpRight size={12} />+{rise.toFixed(1)}%
            </span>
          </div>
          <p className="kpi-caption">
            Next 6 hours<span>vs. current expectation</span>
          </p>
          <svg className="kpi-sparkline" viewBox="0 0 90 28">
            <path
              d="M0 24 10 21 17 23 28 15 36 17 47 9 57 12 68 4 78 6 90 1"
              fill="none"
              stroke="#73cda4"
              strokeWidth="1.3"
            />
          </svg>
        </Panel>
        <Panel className="kpi-card">
          <div className="kpi-label">
            <span>Peak generation</span>
            <TrendingUp size={15} />
          </div>
          <div className="kpi-number-row">
            <strong className="metric-value">{percent(peak.WT01.prediction)}</strong>
            <span className="text-[11px] text-muted">WT-01</span>
          </div>
          <p className="kpi-caption">
            Today · {timeLabel(peak.timestamp)}
            <span>Strong wind window</span>
          </p>
          <div className="kpi-mini-bars">
            {[9, 13, 19, 25, 33, 29, 23, 17, 11].map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </div>
        </Panel>
        <Panel className="kpi-card">
          <div className="kpi-label mb-3">
            <span>Forecast confidence</span>
            <ShieldCheck size={15} />
          </div>
          <ForecastConfidence score={forecast.confidence} factors={forecast.factors} />
          <p className="mt-2 text-[10px] text-muted">System confidence indicator</p>
        </Panel>
        <Panel className="kpi-card">
          <div className="kpi-label">
            <span>Active warnings</span>
            <TriangleAlert size={15} />
          </div>
          <div className="kpi-number-row">
            <strong className={`metric-value ${warning ? 'text-amber-300' : ''}`}>
              {warning ? '1' : '0'}
            </strong>
            <Badge tone={warning ? 'amber' : 'green'}>{warning ? 'MEDIUM' : 'ALL CLEAR'}</Badge>
          </div>
          <p className="kpi-caption">
            {scenario === 'deviation'
              ? 'WT-02 needs attention'
              : scenario === 'api-failure'
                ? 'Backup weather source active'
                : scenario === 'uncertainty'
                  ? 'Wider expected range'
                  : 'No action required'}
          </p>
        </Panel>
      </div>
      {scenario === 'deviation' && (
        <button onClick={() => setPage('twin')} className="warning-banner">
          <TriangleAlert size={17} />
          <div>
            <b>WT-02 behaviour deviation</b>
            <p>Potential underperformance under similar wind conditions. Review the twin analysis.</p>
          </div>
          <ChevronRight size={17} />
        </button>
      )}
      <div className="overview-main">
        <Panel className="forecast-panel">
          <PanelHeading
            title="Forecast overview"
            subtitle={`Expected output across the next ${hours} hours`}
            icon={<ChartIcon />}
            action={
              <div className="flex items-center gap-3">
                <div className="segmented">
                  {[24, 48].map((horizon) => (
                    <button
                      key={horizon}
                      className={hours === horizon ? 'selected' : ''}
                      onClick={() => setHours(horizon)}
                    >
                      {horizon}h
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage('forecast')}
                  className="text-muted hover:text-white"
                  aria-label="Expand forecast"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            }
          />
          <div className="forecast-insight">
            <span className="flex items-center gap-2">
              <span className="status-dot text-emerald-300" />
              {scenario === 'uncertainty'
                ? 'Increased forecast uncertainty'
                : 'Favourable generation conditions'}
            </span>
            <span>
              <CloudSun size={13} />
              {forecast.records[0].windSpeed120m} m/s<span className="text-[#536570]">SW</span>
            </span>
          </div>
          <div className="px-5 pb-2 pt-6">
            <ForecastChart
              records={forecast.records.slice(0, hours)}
              historical={scenario === 'replay'}
              onSelect={setSelected}
              height={228}
            />
          </div>
          <div className="forecast-footer">
            <span>
              <Clock3 size={12} />
              Next update at {timeLabel(forecast.nextUpdate)} UTC
            </span>
            <TextLink onClick={() => setPage('forecast')}>Explore forecast</TextLink>
          </div>
        </Panel>
        <Panel className="fleet-panel">
          <PanelHeading
            title="Wind farm status"
            action={
              <Badge tone={scenario === 'deviation' ? 'amber' : 'green'} dot>
                {scenario === 'deviation' ? 'ATTENTION' : '2 ONLINE'}
              </Badge>
            }
          />
          <div className="farm-visual-wrap">
            <div className="farm-coordinates">
              51.17° N / 71.43° E<span>LIVE TWIN</span>
            </div>
            <TurbineVisual landscape warning={scenario === 'deviation'} />
          </div>
          <div className="fleet-turbines">
            {turbines.map((t) => (
              <TurbineCard key={t.id} turbine={t} onClick={() => setPage('twin')} />
            ))}
          </div>
        </Panel>
      </div>
      <div className="overview-bottom">
        <Panel>
          <PanelHeading
            title="AI Agent activity"
            icon={<Bot size={16} className="text-[#93dec0]" />}
            subtitle="Autonomous intelligence. Every step, visible."
            action={
              <Badge dot tone={busy ? 'blue' : 'green'}>
                {agent.state.toUpperCase()}
              </Badge>
            }
          />
          <div className="px-5 pb-2">
            <AgentTimeline events={events} compact busy={busy} />
          </div>
          <div className="card-footer">
            <span className="flex items-center gap-2 text-[10px] text-muted">
              <span className="status-dot pulse-dot text-emerald-300" />
              {busy ? agent.task : 'Listening for weather updates'}
            </span>
            <TextLink onClick={() => setPage('agent')}>Agent control center</TextLink>
          </div>
        </Panel>
        <Panel className="summary-panel">
          <PanelHeading
            title="AI Forecast Summary"
            icon={<Sparkles size={15} className="text-[#97d8b8]" />}
            action={<span className="text-[9px] tracking-wider text-[#719588]">WINDOPS INTELLIGENCE</span>}
          />
          <div className="summary-content">
            <div className="summary-lead">
              <div className="summary-icon">{warning ? <Activity size={18} /> : <Lightbulb size={18} />}</div>
              <div>
                <h3>
                  {scenario === 'deviation'
                    ? 'WT-02 requires operator attention'
                    : scenario === 'api-failure'
                      ? 'Forecast continuity maintained'
                      : scenario === 'uncertainty'
                        ? 'Plan for a wider operating range'
                        : 'A productive window ahead'}
                </h3>
                <p>
                  {scenario === 'deviation'
                    ? 'WT-02 observed output is below expectation while WT-01 remains consistent with current wind conditions.'
                    : scenario === 'api-failure'
                      ? 'The agent switched to the backup weather feed. Forecast confidence is lower while the primary source is unavailable.'
                      : 'Output is expected to rise through the afternoon, with both turbines responding to stronger winds.'}
                </p>
              </div>
            </div>
            <div className="summary-fact">
              <ArrowUpRight size={15} className="text-emerald-300" />
              <p>
                Peak output of <b>{percent(peak.WT01.prediction)}</b> expected at{' '}
                <b>{timeLabel(peak.timestamp)}</b>.
              </p>
            </div>
            <div className="summary-fact">
              <ArrowDownRight size={15} className="text-sky-300" />
              <p>
                Wind eases to <b>{low.windSpeed120m} m/s</b> tomorrow at <b>{timeLabel(low.timestamp)}</b>.
              </p>
            </div>
            <div className="summary-fact">
              <Activity size={15} className="text-amber-300" />
              <p>
                Expected range widens tomorrow between <b>05:00–08:00</b>.
              </p>
            </div>
          </div>
          <div className="card-footer">
            <span className="flex items-center gap-1.5 text-[10px] text-muted">
              <CircleCheck size={11} className="text-emerald-300" />
              Based on the current 48h forecast
            </span>
            <TextLink onClick={() => setPage('forecast')}>View details</TextLink>
          </div>
        </Panel>
      </div>
      <div className="overview-footnote">
        <span>
          <ShieldCheck size={12} />
          Agentic intelligence for wind energy operations
        </span>
        <span>Predict. Understand. Act.</span>
      </div>
      <ForecastExplanation record={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
function ChartIcon() {
  return <Activity size={15} className="text-[#92bdad]" />
}
