import { useState } from 'react'
import { Download, Wind } from 'lucide-react'
import { useOperations } from '../state/OperationsContext'
import { Panel, PanelHeading, Badge } from '../components/ui/shared'
import { Button } from '../components/ui/button'
import { ForecastChart } from '../components/charts/ForecastChart'
import { WindChart, windSeries, type WindKey } from '../components/charts/WindChart'
import { ForecastExplanation } from '../components/forecast/ForecastExplanation'
import type { ForecastRecord } from '../types/forecast'
import { dateLabel, percent, timeLabel } from '../lib/utils'
export default function Forecast() {
  const { forecast, notify } = useOperations()
  const [hours, setHours] = useState(48)
  const [turbine, setTurbine] = useState<'both' | 'WT01' | 'WT02'>('both')
  const [selected, setSelected] = useState<ForecastRecord | null>(null)
  const [winds, setWinds] = useState<WindKey[]>(['windSpeed10m', 'windSpeed80m', 'windSpeed120m'])
  if (!forecast) return null
  const records = forecast.records.slice(0, hours)
  const download = () => {
    const csv = [
      'timestamp,wind_120m_ms,wind_direction_deg,gusts_ms,temperature_c,pressure_hpa,wt01_prediction,wt02_prediction,confidence',
      ...records.map((r) =>
        [
          r.timestamp,
          r.windSpeed120m,
          r.windDirection,
          r.gusts,
          r.temperature,
          r.pressure,
          r.WT01.prediction,
          r.WT02.prediction,
          r.WT01.confidence,
        ].join(','),
      ),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'windops-forecast.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify('Forecast exported', `${hours} hourly records downloaded as CSV.`)
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="segmented">
            {[24, 48].map((h) => (
              <button className={hours === h ? 'selected' : ''} key={h} onClick={() => setHours(h)}>
                {h} Hours
              </button>
            ))}
          </div>
          <div className="segmented">
            {(['WT01', 'WT02', 'both'] as const).map((t) => (
              <button key={t} className={turbine === t ? 'selected' : ''} onClick={() => setTurbine(t)}>
                {t === 'both' ? 'Both' : t === 'WT01' ? 'WT-01' : 'WT-02'}
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={download}>
          <Download size={14} />
          Export forecast
        </Button>
      </div>
      <Panel>
        <PanelHeading
          title="Predicted power"
          subtitle="Median forecast and expected range · click any point for an explanation"
          action={<Badge tone="blue">{hours}-HOUR HORIZON</Badge>}
        />
        <div className="p-5">
          <ForecastChart
            records={records}
            historical={forecast.scenario === 'replay'}
            turbine={turbine}
            height={310}
            onSelect={setSelected}
          />
        </div>
      </Panel>
      <Panel>
        <PanelHeading
          title="Wind forecast"
          subtitle="Wind speed by measurement height"
          icon={<Wind size={16} className="text-sky-300" />}
          action={
            <div className="flex gap-3">
              {windSeries.map((s) => (
                <label
                  key={s.key}
                  className="flex cursor-pointer items-center gap-1.5 text-[11px]"
                  style={{ color: s.color }}
                >
                  <input
                    type="checkbox"
                    checked={winds.includes(s.key)}
                    onChange={() =>
                      setWinds((w) => (w.includes(s.key) ? w.filter((k) => k !== s.key) : [...w, s.key]))
                    }
                    style={{ accentColor: s.color }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-5">
          {winds.length ? (
            <WindChart records={records} selected={winds} />
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-muted">
              Select a measurement height to display the wind forecast.
            </div>
          )}
        </div>
      </Panel>
      <Panel>
        <PanelHeading
          title="Weather conditions"
          subtitle={`${records.length} hourly records · UTC · normalized turbine output`}
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  'Time',
                  'Wind 120m',
                  'Direction',
                  'Gusts',
                  'Temperature',
                  'Pressure',
                  'WT-01',
                  'WT-02',
                  'Confidence',
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.timestamp} className="cursor-pointer" onClick={() => setSelected(r)}>
                  <td>
                    <button className="text-left hover:text-emerald-300" onClick={() => setSelected(r)}>
                      {dateLabel(r.timestamp)} <b className="ml-2">{timeLabel(r.timestamp)}</b>
                    </button>
                  </td>
                  <td>{r.windSpeed120m.toFixed(1)} m/s</td>
                  <td>{r.windDirection}°</td>
                  <td>{r.gusts.toFixed(1)} m/s</td>
                  <td>{r.temperature.toFixed(1)}°C</td>
                  <td>{r.pressure} hPa</td>
                  <td className="text-emerald-300">{percent(r.WT01.prediction)}</td>
                  <td className="text-sky-300">{percent(r.WT02.prediction)}</td>
                  <td>
                    <Badge dot tone={r.WT01.confidence >= 85 ? 'green' : 'amber'}>
                      {r.WT01.confidence}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <ForecastExplanation
        record={selected}
        onClose={() => setSelected(null)}
        turbine={turbine === 'WT02' ? 'WT02' : 'WT01'}
      />
    </div>
  )
}
