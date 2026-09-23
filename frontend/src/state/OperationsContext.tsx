import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { agentService, anomalyService, forecastService, turbineService } from '../services/api'
import type { AppNotification, ForecastResponse, Page, Scenario } from '../types/forecast'
import type { AgentEvent, AgentStage, AgentStatus } from '../types/agent'
import type { Anomaly, Turbine } from '../types/turbine'

interface OperationsState {
  forecast: ForecastResponse | null
  turbines: Turbine[]
  anomalies: Anomaly[]
  events: AgentEvent[]
  agent: AgentStatus
  scenario: Scenario
  page: Page
  loading: boolean
  busy: boolean
  error: string | null
  notifications: AppNotification[]
  lastUpdate: string
  setPage: (page: Page) => void
  changeScenario: (scenario: Scenario) => Promise<void>
  refresh: () => Promise<void>
  notify: (title: string, description: string, severity?: AppNotification['severity']) => void
  markRead: () => void
}
const OperationsContext = createContext<OperationsState | null>(null)
type Step = { title: string; detail: string; stage: AgentStage; warning?: boolean }
const regularSteps: Step[] = [
  { title: 'Weather forecast received', detail: '48/48 hourly records validated', stage: 'Weather' },
  {
    title: 'Data preparation completed',
    detail: 'No missing critical features',
    stage: 'Feature Preparation',
  },
  { title: 'Forecast calculated', detail: 'WT-01 and WT-02 predictions completed', stage: 'Forecast' },
  { title: 'Twin analysis completed', detail: 'No abnormal turbine divergence', stage: 'Twin Analysis' },
  { title: 'Forecast published', detail: 'Current forecast is ready for operations', stage: 'Publish' },
]
const failureSteps: Step[] = [
  {
    title: 'Primary weather source unavailable',
    detail: 'Weather data temporarily unavailable. Recovery started.',
    stage: 'Weather',
    warning: true,
  },
  { title: 'Retrying request', detail: 'Checking the primary source again', stage: 'Weather' },
  {
    title: 'Primary source still unavailable',
    detail: 'Recovery policy: use validated backup weather feed',
    stage: 'Validation',
    warning: true,
  },
  { title: 'Switching to backup source', detail: 'Requesting the next 48 forecast hours', stage: 'Decision' },
  { title: 'Backup source connected', detail: '48/48 hourly records available', stage: 'Validation' },
  { title: 'Forecast recalculated', detail: 'Both turbines updated using backup weather', stage: 'Forecast' },
  {
    title: 'Forecast published · confidence updated',
    detail: 'HIGH → MEDIUM · system confidence 76/100',
    stage: 'Publish',
  },
]
const deviationSteps: Step[] = [
  {
    title: 'Turbine comparison started',
    detail: 'Comparing WT-01 and WT-02 operating behaviour',
    stage: 'Twin Analysis',
  },
  {
    title: 'Similar wind conditions confirmed',
    detail: 'Both turbines share comparable wind exposure',
    stage: 'Validation',
  },
  {
    title: 'WT-02 unusual behaviour detected',
    detail: 'Observed output differs from expected behaviour',
    stage: 'Twin Analysis',
    warning: true,
  },
  {
    title: 'Forecast confidence adjusted',
    detail: 'Twin consistency reduced · system confidence 79/100',
    stage: 'Decision',
    warning: true,
  },
  {
    title: 'Operator warning created',
    detail: 'Potential underperformance. Operator inspection may be required.',
    stage: 'Publish',
    warning: true,
  },
]
function pageFromHash(): Page {
  const p = window.location.hash.slice(1)
  return ['overview', 'forecast', 'twin', 'agent', 'replay', 'diagnostics'].includes(p)
    ? (p as Page)
    : 'overview'
}

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [turbines, setTurbines] = useState<Turbine[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [agent, setAgent] = useState<AgentStatus>({
    active: true,
    state: 'Monitoring',
    task: 'Monitoring incoming weather updates',
    stage: null,
    source: 'Primary',
  })
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [page, updatePage] = useState<Page>(pageFromHash)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState('13:44')
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'initial',
      title: 'New forecast available',
      description: '48-hour forecast published for both turbines.',
      severity: 'Info',
      time: '13:44',
      read: false,
    },
  ])
  const runId = useRef(0)
  const locked = useRef(false)
  const notify = useCallback(
    (title: string, description: string, severity: AppNotification['severity'] = 'Info') => {
      setNotifications((items) =>
        [
          { id: crypto.randomUUID(), title, description, severity, time: '14:00', read: false },
          ...items,
        ].slice(0, 30),
      )
    },
    [],
  )
  const setPage = useCallback((p: Page) => {
    window.location.hash = p
    updatePage(p)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  useEffect(() => {
    const listener = () => updatePage(pageFromHash())
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    let active = true
    Promise.all([
      forecastService.getForecast(),
      turbineService.getTurbines(),
      anomalyService.getAnomalies(),
      agentService.getStatus(),
      agentService.getHistory(),
    ])
      .then(([f, t, a, s, e]) => {
        if (active) {
          setForecast(f)
          setTurbines(t)
          setAnomalies(a)
          setAgent(s)
          setEvents(e)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setError('Operational data is temporarily unavailable. Please refresh the forecast.')
          setLoading(false)
        }
      })
    return () => {
      active = false
      runId.current++
    }
  }, [])
  useEffect(() => {
    if (loading || busy || error) return
    const timer = window.setInterval(() => {
      setEvents((history) =>
        [
          ...history,
          {
            id: crypto.randomUUID(),
            time: '14:00:30',
            title: 'Weather feed checked',
            detail: 'No newer weather issue detected. Current forecast remains available.',
            status: 'completed' as const,
            stage: 'Weather' as const,
          },
        ].slice(-30),
      )
    }, 25000)
    return () => window.clearInterval(timer)
  }, [loading, busy, error])
  const changeScenario = useCallback(
    async (next: Scenario) => {
      if (locked.current) return
      locked.current = true
      const id = ++runId.current
      setBusy(true)
      setError(null)
      setScenario(next)
      if (next === 'replay') setPage('replay')
      try {
        const [f, t, a] = await Promise.all([
          forecastService.getForecast(next),
          turbineService.getTurbines(next),
          anomalyService.getAnomalies(next),
        ])
        if (runId.current !== id) return
        const previous =
          forecast?.records
            .slice(0, 6)
            .reduce((sum, r) => sum + (r.WT01.prediction + r.WT02.prediction) / 2, 0) || 1
        const current = f.records
          .slice(0, 6)
          .reduce((sum, r) => sum + (r.WT01.prediction + r.WT02.prediction) / 2, 0)
        const change = (((current - previous) / previous) * 100).toFixed(1)
        setForecast(f)
        setTurbines(t)
        setAnomalies(a)
        setEvents([])
        const steps =
          next === 'api-failure'
            ? failureSteps
            : next === 'deviation'
              ? deviationSteps
              : next === 'weather-update'
                ? [
                    {
                      title: 'New forecast received',
                      detail: 'Updated weather issue detected',
                      stage: 'Weather' as const,
                    },
                    {
                      title: 'Weather forecast changed',
                      detail: `Next 6h expected generation changed by ${Number(change) >= 0 ? '+' : ''}${change}%`,
                      stage: 'Decision' as const,
                    },
                    ...regularSteps.slice(2),
                  ]
                : next === 'uncertainty'
                  ? [
                      ...regularSteps.slice(0, 3),
                      {
                        title: 'Forecast uncertainty increased',
                        detail: 'Weather agreement reduced · wider expected range · confidence 62/100',
                        stage: 'Decision' as const,
                        warning: true,
                      },
                      regularSteps[4],
                    ]
                  : regularSteps
        if (next === 'api-failure')
          notify(
            'Weather source temporarily unavailable',
            'AI Agent is retrying the primary source and preparing recovery.',
            'Warning',
          )
        for (const [index, step] of steps.entries()) {
          if (runId.current !== id) return
          setAgent({
            active: true,
            state: next === 'api-failure' ? 'Recovering' : 'Processing',
            task: step.title,
            stage: step.stage,
            source: next === 'api-failure' && index >= 4 ? 'Backup' : 'Primary',
          })
          const detail =
            next === 'api-failure' && index === steps.length - 1
              ? `${(forecast?.confidence ?? 94) >= 85 ? 'HIGH' : 'MEDIUM'} → MEDIUM · system confidence 76/100`
              : step.detail
          setEvents((e) => [
            ...e,
            {
              id: `${id}-${index}`,
              time: `14:00:${String(index * 3).padStart(2, '0')}`,
              title: step.title,
              detail,
              stage: step.stage,
              status: step.warning ? 'warning' : 'completed',
            },
          ])
          await new Promise((resolve) => setTimeout(resolve, 650))
        }
        if (runId.current !== id) return
        setAgent({
          active: true,
          state: 'Monitoring',
          task: 'Monitoring incoming weather updates',
          stage: null,
          source: next === 'api-failure' ? 'Backup' : 'Primary',
        })
        setLastUpdate('14:00')
        notify(
          next === 'deviation'
            ? 'WT-02 unusual behaviour detected'
            : next === 'api-failure'
              ? 'Weather source recovered'
              : next === 'weather-update'
                ? 'Weather forecast changed significantly'
                : 'Forecast recalculated',
          next === 'deviation'
            ? 'Potential underperformance requires operator attention.'
            : next === 'api-failure'
              ? 'Backup source connected. Forecast confidence is now 76/100.'
              : `Updated 48-hour forecast · confidence ${f.confidence}/100.`,
          ['deviation', 'api-failure', 'uncertainty'].includes(next) ? 'Warning' : 'Info',
        )
      } catch {
        setError('Weather data temporarily unavailable. AI Agent is attempting recovery.')
        notify('Forecast update unavailable', 'Please try refreshing the forecast again.', 'Warning')
      } finally {
        if (runId.current === id) {
          setBusy(false)
          setLoading(false)
          locked.current = false
        }
      }
    },
    [forecast, notify, setPage],
  )
  return (
    <OperationsContext.Provider
      value={{
        forecast,
        turbines,
        anomalies,
        events,
        agent,
        scenario,
        page,
        loading,
        busy,
        error,
        notifications,
        lastUpdate,
        setPage,
        changeScenario,
        refresh: () => changeScenario(scenario),
        notify,
        markRead: () => setNotifications((items) => items.map((n) => ({ ...n, read: true }))),
      }}
    >
      {children}
    </OperationsContext.Provider>
  )
}
export function useOperations() {
  const context = useContext(OperationsContext)
  if (!context) throw new Error('OperationsProvider is required')
  return context
}
