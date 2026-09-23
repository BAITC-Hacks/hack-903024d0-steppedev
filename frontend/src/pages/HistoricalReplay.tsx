import { useEffect, useRef, useState } from 'react'
import { Check, Clock3, History, LoaderCircle, Play, ShieldCheck } from 'lucide-react'
import { Panel, PanelHeading, Badge } from '../components/ui/shared'
import { Button } from '../components/ui/button'
import { ForecastChart } from '../components/charts/ForecastChart'
import { replayService } from '../services/api'
import { useOperations } from '../state/OperationsContext'
import type { ReplayResult } from '../types/forecast'
import { dateLabel, timeLabel } from '../lib/utils'
const logSteps = [
  'Loading weather forecast available at selected time…',
  'Validating forecast issue time…',
  'Preparing features…',
  'Running turbine models…',
  'Generating forecast…',
  'Done. Historical forecast ready.',
]
export default function HistoricalReplay() {
  const { notify } = useOperations()
  const [date, setDate] = useState('2026-02-03')
  const [time, setTime] = useState('08:00')
  const [result, setResult] = useState<ReplayResult | null>(null)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState('')
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const run = async () => {
    if (!date || !time || date < '2023-03-01' || `${date}T${time}` > '2026-09-23T14:00') {
      setError('Choose an origin between 1 March 2023 and 23 September 2026, 14:00 UTC.')
      return
    }
    setRunning(true)
    setError('')
    setLogs([])
    setResult(null)
    try {
      for (const step of logSteps.slice(0, -1)) {
        if (!mounted.current) return
        setLogs((l) => [...l, step])
        await new Promise((resolve) => setTimeout(resolve, 480))
      }
      const replay = await replayService.run(date, time)
      if (mounted.current) {
        setResult(replay)
        setLogs((l) => [...l, logSteps[5]])
        notify(
          'Historical replay completed',
          `Forecast origin ${dateLabel(replay.origin)} ${timeLabel(replay.origin)} UTC. No future data used in the demo fixture.`,
        )
      }
    } catch {
      if (mounted.current)
        setError('The replay could not be completed. Check the selected date and try again.')
    } finally {
      if (mounted.current) setRunning(false)
    }
  }
  const selectedDate = new Date(`${date || '2026-02-03'}T${time || '08:00'}:00Z`)
  const daysInMonth = new Date(
    Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() + 1, 0),
  ).getUTCDate()
  const changeDate = (value: string) => {
    setDate(value)
    setResult(null)
    setLogs([])
  }
  return (
    <div className="space-y-5">
      <Panel className="time-machine">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="time-machine-icon">
              <History size={24} />
            </div>
            <div>
              <p className="text-[10px] tracking-[.2em] text-emerald-300">TIME MACHINE</p>
              <h2 className="mt-1 text-lg">A past moment. A fresh perspective.</h2>
            </div>
          </div>
          <Badge tone="blue">POINT-IN-TIME REPLAY</Badge>
        </div>
        <div className="replay-controls">
          <label>
            Forecast date
            <input
              type="date"
              value={date}
              max="2026-09-23"
              min="2023-03-01"
              disabled={running}
              onChange={(e) => changeDate(e.target.value)}
            />
          </label>
          <label>
            Origin time · UTC
            <input
              type="time"
              value={time}
              disabled={running}
              onChange={(e) => {
                setTime(e.target.value)
                setResult(null)
                setLogs([])
              }}
            />
          </label>
          <Button disabled={running || !date || !time} onClick={() => void run()}>
            {running ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={15} />}
            {running ? 'Running replay…' : 'Run Historical Forecast'}
          </Button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-amber-300" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8">
          <input
            className="replay-slider"
            aria-label="Historical day"
            type="range"
            min={1}
            max={daysInMonth}
            value={selectedDate.getUTCDate()}
            disabled={running || !date}
            onChange={(e) => changeDate(`${date.slice(0, 7)}-${String(e.target.value).padStart(2, '0')}`)}
          />
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            {[1, 7, 14, 21, daysInMonth].map((day) => (
              <span key={day}>
                {selectedDate.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })} {day}
              </span>
            ))}
          </div>
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Panel className="historical-mode p-6">
          <div className="mb-6 flex items-center gap-2 text-xs text-sky-300">
            <Clock3 size={15} />
            HISTORICAL MODE
          </div>
          <p className="font-mono text-3xl tracking-tight">
            {selectedDate
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              })
              .toUpperCase()}
          </p>
          <p className="mt-2 font-mono text-2xl text-muted">
            {time || '08:00'} <span className="text-sm">UTC</span>
          </p>
          <p className="mt-6 text-xs leading-6 text-muted">
            Only information available at this point in time is used.
          </p>
          <div className="mt-5 border-t border-white/10 pt-5">
            {result ? (
              <Badge tone={result.leakageCheck ? 'green' : 'amber'}>
                <ShieldCheck size={12} />
                {result.leakageCheck ? 'NO FUTURE DATA USED ✓' : 'ISSUE TIME REQUIRES REVIEW'}
              </Badge>
            ) : (
              <span className="text-xs text-muted">Run replay to validate the forecast origin.</span>
            )}
          </div>
          <p className="mt-4 text-[10px] leading-5 text-muted">
            Demo: archive timing and issue-time checks are simulated with deterministic fixtures. No
            production archive is connected.
          </p>
        </Panel>
        <Panel>
          <PanelHeading title="Replay provenance" subtitle="A transparent record of what was available" />
          <div className="grid gap-x-8 gap-y-5 px-5 pb-6 sm:grid-cols-2">
            {[
              [
                'Forecast origin',
                `${dateLabel(selectedDate.toISOString())} ${selectedDate.getUTCFullYear()} · ${time}`,
              ],
              [
                'Weather forecast available',
                result
                  ? `${dateLabel(result.weatherIssuedAt)} · ${timeLabel(result.weatherIssuedAt)} UTC`
                  : 'Pending replay',
              ],
              ['Forecast horizon', '48 hours'],
              ['Weather source', 'Historical Forecast Archive'],
              ['Model', 'wind_power_v1.4'],
              [
                'Data leakage check',
                result ? (result.leakageCheck ? 'PASSED' : 'NOT PASSED') : 'Not yet checked',
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] text-muted">{label}</p>
                <p className={`mt-2 text-sm ${value === 'PASSED' ? 'text-emerald-300' : ''}`}>{value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {logs.length > 0 && (
        <Panel>
          <PanelHeading
            title="Replay execution log"
            action={running ? <Badge tone="blue">RUNNING</Badge> : <Badge>COMPLETED</Badge>}
          />
          <div className="space-y-3 px-5 pb-5" role="log" aria-live="polite">
            {logs.map((log, i) => (
              <div key={log} className="flex items-center gap-3 font-mono text-xs">
                <span className="text-[#546672]">0{i + 1}</span>
                {running && i === logs.length - 1 ? (
                  <LoaderCircle size={12} className="animate-spin text-sky-300" />
                ) : (
                  <Check size={12} className="text-emerald-300" />
                )}
                <span className="text-muted">{log}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {result ? (
        <Panel>
          <PanelHeading
            title="Historical 48-hour prediction"
            subtitle={`Forecast issued from ${dateLabel(result.origin)} · ${timeLabel(result.origin)} UTC`}
            action={<Badge tone="blue">ARCHIVE REPLAY</Badge>}
          />
          <div className="p-5">
            <ForecastChart records={result.forecast.records} height={290} historical />
          </div>
        </Panel>
      ) : (
        !running && (
          <div className="replay-empty">
            <History size={28} strokeWidth={1.2} />
            <p>Choose a moment. Recreate the forecast.</p>
            <span>Your historical prediction will appear here.</span>
          </div>
        )
      )}
    </div>
  )
}
