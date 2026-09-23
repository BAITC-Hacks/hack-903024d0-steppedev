import {
  ArrowRight,
  Bot,
  Check,
  CloudDownload,
  Database,
  GitCompareArrows,
  LoaderCircle,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { useOperations } from '../state/OperationsContext'
import { Badge, Panel, PanelHeading } from '../components/ui/shared'
import { Button } from '../components/ui/button'
import { AgentTimeline } from '../components/agent/AgentTimeline'
import type { AgentStage } from '../types/agent'
const stages: { label: AgentStage; icon: typeof Bot; description: string }[] = [
  { label: 'Weather', icon: CloudDownload, description: 'Receive weather feed' },
  { label: 'Validation', icon: ShieldCheck, description: 'Check data quality' },
  { label: 'Feature Preparation', icon: Database, description: 'Prepare model inputs' },
  { label: 'Forecast', icon: Sparkles, description: 'Predict both turbines' },
  { label: 'Twin Analysis', icon: GitCompareArrows, description: 'Compare behaviour' },
  { label: 'Decision', icon: Workflow, description: 'Evaluate next action' },
  { label: 'Publish', icon: Send, description: 'Deliver the forecast' },
]
export default function Agent() {
  const { agent, busy, changeScenario, events, scenario, forecast } = useOperations()
  const activeIndex = stages.findIndex((s) => s.label === agent.stage)
  return (
    <div className="space-y-5">
      <Panel className="agent-status-panel">
        <div className="agent-orb">
          <Bot size={34} strokeWidth={1.3} />
          <span />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <p className="text-[10px] tracking-[.15em] text-muted">CURRENT TASK</p>
            <Badge dot>{busy ? agent.state.toUpperCase() : 'ACTIVE'}</Badge>
          </div>
          <h2 className="text-xl font-medium">{agent.task}</h2>
          <p className="mt-2 text-xs text-muted">
            Autonomous forecast orchestration · {agent.source} weather source · {forecast?.confidence}/100
            confidence
          </p>
        </div>
        <div className="agent-status-stat">
          <p>
            48<span> hours</span>
          </p>
          <small>Continuous forecast horizon</small>
        </div>
      </Panel>
      <Panel>
        <PanelHeading
          title="Agent workflow"
          subtitle="From weather signal to operator decision"
          icon={<Workflow size={16} className="text-emerald-300" />}
          action={
            <span className="flex items-center gap-2 text-[10px] text-emerald-300">
              <span className="status-dot pulse-dot" />
              {busy ? 'PIPELINE RUNNING' : 'MONITORING'}
            </span>
          }
        />
        <div className="workflow">
          {stages.map((s, i) => {
            const running = busy && activeIndex === i
            const waiting = busy && activeIndex < i
            const warning =
              (scenario === 'api-failure' && i === 0) ||
              (scenario === 'deviation' && i === 4) ||
              (scenario === 'uncertainty' && i === 5)
            return (
              <div
                className={`workflow-stage ${running ? 'running' : ''} ${warning ? 'warning' : ''}`}
                key={s.label}
              >
                <div className="workflow-icon">
                  <s.icon size={21} strokeWidth={1.5} />
                </div>
                <span className="workflow-index">0{i + 1}</span>
                <h3>{s.label}</h3>
                <p>{s.description}</p>
                <div className="workflow-state">
                  {running ? (
                    <LoaderCircle size={11} className="animate-spin" />
                  ) : waiting ? (
                    <span className="status-dot" />
                  ) : (
                    <Check size={11} />
                  )}
                  {running ? 'Running' : warning ? 'Warning' : waiting ? 'Waiting' : 'Completed'}
                </div>
                {i < stages.length - 1 && <ArrowRight className="workflow-arrow" size={14} />}
              </div>
            )
          })}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <Panel>
          <PanelHeading
            title="Agent event stream"
            subtitle="Every action recorded with a clear operational explanation"
            icon={<Radio size={16} />}
            action={
              <Badge dot tone="blue">
                LIVE DEMO
              </Badge>
            }
          />
          <div className="min-h-72 px-5 pb-5" role="log" aria-label="Agent events" aria-live="polite">
            <AgentTimeline events={events} busy={busy} />
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel className="p-5">
            <Badge tone="gray">INTERACTIVE DEMO</Badge>
            <h3 className="mt-4 text-base font-medium">See autonomy in action.</h3>
            <p className="mb-5 mt-2 text-xs leading-6 text-muted">
              Introduce a weather change or interrupt the primary source. Watch the agent evaluate, recover,
              and publish a new forecast.
            </p>
            <Button
              className="mb-3 w-full"
              variant="outline"
              disabled={busy}
              onClick={() => void changeScenario('weather-update')}
            >
              <RefreshCw size={14} />
              Simulate weather update
            </Button>
            <Button
              className="w-full border-amber-300/25 text-amber-200"
              variant="outline"
              disabled={busy}
              onClick={() => void changeScenario('api-failure')}
            >
              <CloudDownload size={14} />
              Simulate API failure
            </Button>
            {busy && (
              <p className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
                <LoaderCircle size={12} className="animate-spin" />
                Agent is processing this scenario…
              </p>
            )}
          </Panel>
          <Panel className="p-5">
            <h3 className="text-xs font-medium">Recovery policy</h3>
            <div className="mt-4 space-y-3 text-xs text-muted">
              <p>
                <span className="mr-2 text-emerald-300">01</span>Retry the primary weather source
              </p>
              <p>
                <span className="mr-2 text-emerald-300">02</span>Validate the backup source
              </p>
              <p>
                <span className="mr-2 text-emerald-300">03</span>Recalculate and adjust confidence
              </p>
              <p>
                <span className="mr-2 text-emerald-300">04</span>Publish and notify the operator
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
