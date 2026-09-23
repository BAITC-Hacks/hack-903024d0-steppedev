import type { Turbine } from '../types/turbine'
import type { ForecastResponse } from '../types/forecast'

export function makeTurbines(forecast: ForecastResponse): Turbine[] {
  const first = forecast.records[0]
  return (['WT-01', 'WT-02'] as const).map((id, i) => {
    const power = i === 0 ? first.WT01 : first.WT02
    const deviation = forecast.scenario === 'deviation' && i === 1
    return { id, name: `Wind Turbine 0${i + 1}`, wind: first.windSpeed120m - i * 0.2, direction: first.windDirection, temperature: first.temperature, expected: power.prediction, observed: deviation ? 0.24 : power.prediction - 0.02, confidence: deviation ? 64 : power.confidence, status: deviation ? 'deviation' : 'normal' }
  })
}
