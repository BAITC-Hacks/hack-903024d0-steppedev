import { Bot, Check, Clock3 } from 'lucide-react'
import { useOperations } from '../../state/OperationsContext'
import { timeLabel } from '../../lib/utils'

export function OperationsStatus() {
  const { agent, events, forecast, busy, setPage } = useOperations()
  return (
    <div className="operations-status">
      <button onClick={() => setPage('agent')}>
        <Bot size={13} />
        <span>
          Agent <b>{agent.state}</b>
        </span>
        <i className={`status-dot ${busy ? 'pulse-dot' : ''}`} />
      </button>
      <span className="operations-last">
        <Check size={12} />
        {busy ? agent.task : `Last action: ${events.at(-1)?.title || 'Waiting for data'}`}
      </span>
      {forecast && (
        <span className="operations-next">
          <Clock3 size={12} />
          Next forecast <b>{timeLabel(forecast.nextUpdate)} UTC</b>
        </span>
      )}
    </div>
  )
}
