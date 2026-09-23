import { ArrowUpRight, Compass, Thermometer, Wind } from 'lucide-react'
import type { Turbine } from '../../types/turbine'
import { percent } from '../../lib/utils'
import { Badge } from '../ui/shared'
import { TurbineVisual } from './TurbineVisual'
export function TurbineCard({
  turbine,
  onClick,
  detailed = false,
}: {
  turbine: Turbine
  onClick?: () => void
  detailed?: boolean
}) {
  return (
    <div className={`turbine-card ${turbine.status === 'deviation' ? 'is-warning' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${turbine.id === 'WT-01' ? 'bg-[#8ce4b8]' : 'bg-[#69b7ef]'}`}
          />
          {detailed ? turbine.name : turbine.id}
        </span>
        <Badge tone={turbine.status === 'deviation' ? 'amber' : 'green'} dot>
          {turbine.status === 'deviation' ? 'DEVIATION' : 'NORMAL'}
        </Badge>
      </div>
      <div className="turbine-main">
        <div>
          <span className="text-[10px] text-muted">Expected power</span>
          <p className="mt-1 text-[30px] font-medium tracking-tight">{percent(turbine.expected)}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
            <Wind size={12} />
            <span className="text-[#bdc9d3]">{turbine.wind.toFixed(1)}</span> m/s{' '}
            <span className="ml-2 text-emerald-300">↗</span>
          </div>
        </div>
        <TurbineVisual warning={turbine.status === 'deviation'} />
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <Compass size={11} />
          {turbine.direction}° SW
        </span>
        <span className="flex items-center gap-1">
          <Thermometer size={11} />
          {turbine.temperature.toFixed(0)}°C
        </span>
        <span className={turbine.confidence >= 85 ? 'text-[#8cbaaa]' : 'text-amber-300'}>
          {turbine.confidence >= 85 ? 'High' : 'Medium'} confidence
        </span>
      </div>
      {detailed && (
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
          <div>
            <p className="text-xs text-muted">Observed power</p>
            <p className={`mt-1 text-2xl ${turbine.status === 'deviation' ? 'text-amber-300' : ''}`}>
              {percent(turbine.observed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Operating state</p>
            <p className="mt-2 text-sm">
              {turbine.status === 'deviation' ? 'Attention required' : 'Within expected range'}
            </p>
          </div>
        </div>
      )}
      {onClick && (
        <button
          onClick={onClick}
          className="mt-3 flex w-full items-center justify-between text-[10px] text-muted hover:text-emerald-300"
        >
          View digital twin
          <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  )
}
