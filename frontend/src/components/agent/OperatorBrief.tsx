import { ArrowRight, Info, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useOperations } from '../../state/OperationsContext'
import { useI18n } from '../../i18n/I18nContext'
import { Button } from '../ui/button'
export function OperatorBrief() {
  const { forecast, busy, error, setPage } = useOperations()
  const { t } = useI18n()
  const stale = forecast?.stale || !!error
  const Icon = busy ? LoaderCircle : stale ? TriangleAlert : Info
  return (
    <section
      className={`operator-brief ${stale ? 'warning' : 'info'}`}
      aria-label={t('OPERATOR BRIEFING')}
      data-testid="operator-brief"
    >
      <div className="brief-icon">
        <Icon size={22} className={busy ? 'animate-spin' : ''} />
      </div>
      <div className="brief-copy" aria-live="polite">
        <span>{t('OPERATOR BRIEFING')}</span>
        <h2>
          {t(
            busy
              ? 'Forecast update in progress'
              : stale
                ? 'Forecast update needs attention'
                : 'Forecast ready · telemetry not connected',
          )}
        </h2>
        <p>
          {t(
            busy
              ? 'The backend is receiving weather and running the trained model. Follow the execution log.'
              : stale
                ? 'The last published forecast is shown. Check its date before using it for operational decisions.'
                : 'Power estimates use current weather and your trained model. Current turbine measurements are unavailable; operating state is not verified.',
          )}
        </p>
      </div>
      <Button variant="outline" onClick={() => setPage(stale || busy ? 'agent' : 'forecast')}>
        {t(stale || busy ? 'View update progress' : 'View 48-hour forecast')}
        <ArrowRight size={14} />
      </Button>
    </section>
  )
}
