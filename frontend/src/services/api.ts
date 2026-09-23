import { FORECAST_ORIGIN, makeForecast } from '../data/mockForecast'
import { makeTurbines } from '../data/mockTurbines'
import { mockAnomalies } from '../data/mockAnomalies'
import { mockAgentEvents } from '../data/mockAgentEvents'
import { makeExplanation } from '../data/mockExplanations'
import type { ForecastRecord, Scenario } from '../types/forecast'
import type { AgentStatus } from '../types/agent'

const respond = async <T>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, 220))
  return structuredClone(value)
}
export const explanationService = {
  getExplanation: (record: ForecastRecord, turbine: 'WT01' | 'WT02') =>
    respond(makeExplanation(record, turbine)),
}
// The UI depends only on these service contracts. Replace respond with typed fetch calls.
export const forecastService = {
  getForecast: (scenario: Scenario = 'normal') => respond(makeForecast(scenario)),
} // GET /api/forecast
export const weatherService = {
  getWeather: (scenario: Scenario = 'normal') =>
    respond(makeForecast(scenario).records.map(({ WT01: _a, WT02: _b, ...weather }) => weather)),
} // GET /api/weather
export const turbineService = {
  getTurbines: (scenario: Scenario = 'normal') => respond(makeTurbines(makeForecast(scenario))),
} // GET /api/turbines
export const anomalyService = {
  getAnomalies: (scenario: Scenario = 'normal') =>
    respond(
      scenario === 'deviation'
        ? [
            {
              id: 'active',
              date: '2026-09-23',
              turbine: 'WT-02',
              title: 'Potential underperformance',
              duration: 'Active now',
              active: true,
            },
            ...mockAnomalies,
          ]
        : mockAnomalies,
    ),
} // GET /api/anomalies
export const agentService = {
  getStatus: () =>
    respond<AgentStatus>({
      active: true,
      task: 'Monitoring incoming weather updates',
      state: 'Monitoring',
      stage: null,
      source: 'Primary',
    }), // GET /api/agent/status
  getHistory: () => respond(mockAgentEvents), // GET /api/agent/history
}
export const replayService = {
  run: async (date: string, time: string) => {
    // POST /api/replay
    const requested = `${date}T${time}:00.000Z`
    const parsed = new Date(requested)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(time) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString() !== requested ||
      requested > FORECAST_ORIGIN ||
      date < '2023-03-01'
    ) {
      throw new Error('Choose an available historical origin before the demo operating time.')
    }
    const origin = parsed.toISOString()
    const weatherIssuedAt = new Date(new Date(origin).getTime() - 18 * 60000).toISOString()
    return respond({
      forecast: makeForecast('replay', origin),
      origin,
      weatherIssuedAt,
      leakageCheck: new Date(weatherIssuedAt) <= new Date(origin),
    })
  },
}
