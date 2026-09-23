import type { ForecastRecord, ForecastResponse, Scenario } from '../types/forecast'

// Deterministic demo fixtures, not an inference model. Replace through services/api.ts.
const windAnchors = [9.4, 10.0, 10.8, 11.5, 11.8, 11.1, 9.8, 8.4, 6.2, 6.8, 8.4, 9.4, 10.1, 10.8, 11.3, 10.4, 9.0]
const round = (n: number) => Math.round(n * 100) / 100
export const FORECAST_ORIGIN = '2026-09-23T14:00:00.000Z'
export const scenarios: { value: Scenario; label: string }[] = [
  { value: 'normal', label: 'Normal Operation' }, { value: 'weather-update', label: 'Weather Update' },
  { value: 'deviation', label: 'WT-02 Deviation' }, { value: 'api-failure', label: 'Weather API Failure' },
  { value: 'uncertainty', label: 'High Forecast Uncertainty' }, { value: 'replay', label: 'Historical Replay' },
]
export function makeForecast(scenario: Scenario = 'normal', origin = FORECAST_ORIGIN): ForecastResponse {
  const confidence = scenario === 'api-failure' ? 76 : scenario === 'uncertainty' ? 62 : scenario === 'deviation' ? 79 : 94
  const records: ForecastRecord[] = Array.from({ length: 48 }, (_, i) => {
    const anchor = i / 3
    let wind = windAnchors[Math.floor(anchor)] + (windAnchors[Math.ceil(anchor)] - windAnchors[Math.floor(anchor)]) * (anchor % 1)
    if (scenario === 'weather-update') wind += 0.45 * Math.sin(i / 9 + 0.5) + 0.3
    const power = Math.min(0.96, Math.max(0.08, (wind - 3) / 10.5))
    const spread = (scenario === 'uncertainty' ? 0.18 : scenario === 'api-failure' ? 0.12 : 0.065) + i * 0.0006 + (i >= 15 && i <= 18 ? 0.05 : 0)
    const turbine = (p: number) => ({ prediction: round(p), lower: round(Math.max(0, p - spread)), upper: round(Math.min(1, p + spread)), confidence: Math.max(40, confidence - Math.round(i / 12) - (i >= 15 && i <= 18 ? 8 : 0)) })
    return { timestamp: new Date(new Date(origin).getTime() + i * 3600000).toISOString(), windSpeed10m: round(wind * 0.71), windSpeed80m: round(wind * 0.92), windSpeed120m: round(wind), windDirection: Math.round(238 + 18 * Math.sin(i / 10)), gusts: round(wind * 1.34), temperature: round(8 + 3 * Math.sin(i / 7)), pressure: Math.round(1015 + 4 * Math.sin(i / 14)), WT01: turbine(power), WT02: turbine(power * 0.97 + 0.006 * Math.sin(i / 5)) }
  })
  return { records, confidence, factors: { weatherData: scenario === 'api-failure' ? 78 : 100, modelStability: scenario === 'uncertainty' ? 55 : 91, twinConsistency: scenario === 'deviation' ? 42 : 97, dataFreshness: 100, forecastAgreement: scenario === 'uncertainty' ? 49 : scenario === 'api-failure' ? 65 : 85 }, source: scenario === 'api-failure' ? 'Backup weather source' : scenario === 'replay' ? 'Historical Forecast Archive' : 'Primary weather source', issuedAt: new Date(new Date(origin).getTime() - 18 * 60000).toISOString(), nextUpdate: new Date(new Date(origin).getTime() + 42 * 60000).toISOString(), scenario }
}
