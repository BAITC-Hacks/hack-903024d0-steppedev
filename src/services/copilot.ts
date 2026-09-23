import type { ForecastResponse } from '../types/forecast'
import type { Turbine } from '../types/turbine'
import { dateLabel, percent, timeLabel } from '../lib/utils'
export const suggestedQuestions = [
  'Why does generation decrease tomorrow?',
  'When is peak generation expected?',
  'Compare WT-01 and WT-02',
  'What changed since the previous forecast?',
  'Are there any anomalies?',
  'Why is forecast confidence lower?',
]
export function getCopilotAnswer(
  question: string,
  forecast: ForecastResponse,
  turbines: Turbine[],
): { answer: string; references: string[] } {
  const q = question.toLowerCase()
  const peak = forecast.records.reduce((a, b) => (a.WT01.prediction > b.WT01.prediction ? a : b))
  const low = forecast.records.reduce((a, b) => (a.windSpeed120m < b.windSpeed120m ? a : b))
  const first = forecast.records[0]
  if (/peak|highest|maximum|пик|максим/.test(q))
    return {
      answer: `Peak WT-01 generation is expected on ${dateLabel(peak.timestamp)} at ${timeLabel(peak.timestamp)} UTC: ${percent(peak.WT01.prediction)}, with an expected range of ${percent(peak.WT01.lower)}–${percent(peak.WT01.upper)}. WT-02 is expected to produce ${percent(peak.WT02.prediction)} at the same time. Wind at 120 m reaches ${peak.windSpeed120m.toFixed(1)} m/s.`,
      references: ['Forecast data', 'Weather forecast'],
    }
  if (/decreas|drop|decline|tomorrow|пада|сниже|завтра/.test(q))
    return {
      answer: `The main driver is the expected decline in wind at 120 m from ${peak.windSpeed120m.toFixed(1)} m/s at the peak to ${low.windSpeed120m.toFixed(1)} m/s on ${dateLabel(low.timestamp)} at ${timeLabel(low.timestamp)} UTC. Expected output then falls to ${percent(low.WT01.prediction)} for WT-01 and ${percent(low.WT02.prediction)} for WT-02. Both turbines show a similar response. The expected WT-01 range at that time is ${percent(low.WT01.lower)}–${percent(low.WT01.upper)}.`,
      references: ['Forecast data', 'Weather forecast'],
    }
  if (/confiden|lower|уверен|довер/.test(q))
    return {
      answer: `Current system confidence is ${forecast.confidence}/100. Weather data scores ${forecast.factors.weatherData}, model stability ${forecast.factors.modelStability}, twin consistency ${forecast.factors.twinConsistency}, data freshness ${forecast.factors.dataFreshness}, and forecast agreement ${forecast.factors.forecastAgreement}. ${forecast.scenario === 'api-failure' ? 'The backup weather source is active, reducing source agreement.' : forecast.scenario === 'deviation' ? 'WT-02 behaviour reduces twin consistency.' : forecast.scenario === 'uncertainty' ? 'Lower agreement between weather sources produces a wider expected range.' : 'Data quality and turbine consistency support high confidence.'} This is an operational indicator, not a probability that the forecast is correct.`,
      references: ['Forecast data', 'Twin comparison'],
    }
  if (/compar|twin|anomal|deviat|сравн|аномал|отклон/.test(q))
    return {
      answer: `WT-01: expected ${percent(turbines[0].expected)}, observed ${percent(turbines[0].observed)}, wind ${turbines[0].wind.toFixed(1)} m/s. WT-02: expected ${percent(turbines[1].expected)}, observed ${percent(turbines[1].observed)}, wind ${turbines[1].wind.toFixed(1)} m/s. ${forecast.scenario === 'deviation' ? 'WT-02 shows potential underperformance despite similar wind conditions. Operator inspection may be required; this signal does not confirm a mechanical fault.' : 'Both turbines are within their expected operating range. No active turbine anomaly is present.'}`,
      references: ['Twin comparison', 'Forecast data'],
    }
  if (/chang|previous|измен|предыдущ/.test(q))
    return {
      answer:
        forecast.scenario === 'weather-update'
          ? `An updated weather fixture is active. Current wind at 120 m is ${first.windSpeed120m.toFixed(1)} m/s, and expected current output is ${percent(first.WT01.prediction)} for WT-01 and ${percent(first.WT02.prediction)} for WT-02. The agent recalculated both forecasts; the event log records the measured change against the previous run.`
          : forecast.scenario === 'api-failure'
            ? `The weather source changed to the backup feed. The forecast was recalculated and system confidence adjusted to ${forecast.confidence}/100.`
            : 'The current scenario has no new weather update. Use “Simulate weather update” in the AI Agent control center to compare a revised forecast with the current run.',
      references: ['Forecast data', 'Agent event log'],
    }
  return {
    answer:
      'I can explain the displayed forecast, peak generation, weather conditions, turbine differences, confidence, and agent actions. Try one of the suggested questions. This demo uses prepared responses grounded in the current dataset; it is not connected to a language model.',
    references: ['Forecast data'],
  }
}
