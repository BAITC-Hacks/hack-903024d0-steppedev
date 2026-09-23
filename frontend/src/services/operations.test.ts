import { describe, expect, it } from 'vitest'
import { forecastService, turbineService, replayService, anomalyService } from './api'
import { getCopilotAnswer } from './copilot'
import { scenarios } from '../data/mockForecast'

describe('Operational data contracts', () => {
  it.each(scenarios)(
    '$label supplies valid consecutive hourly forecasts and ordered bounds',
    async ({ value }) => {
      const forecast = await forecastService.getForecast(value)
      expect(forecast.records).toHaveLength(48)
      forecast.records.forEach((r, i) => {
        for (const turbine of [r.WT01, r.WT02]) {
          expect(turbine.lower).toBeGreaterThanOrEqual(0)
          expect(turbine.lower).toBeLessThanOrEqual(turbine.prediction)
          expect(turbine.upper).toBeGreaterThanOrEqual(turbine.prediction)
          expect(turbine.upper).toBeLessThanOrEqual(1)
        }
        expect(r.windSpeed120m).toBeGreaterThan(r.windSpeed80m)
        expect(r.windSpeed80m).toBeGreaterThan(r.windSpeed10m)
        if (i) expect(Date.parse(r.timestamp) - Date.parse(forecast.records[i - 1].timestamp)).toBe(3600000)
      })
    },
  )
  it('keeps expected forecasts distinct from observed underperformance', async () => {
    const [turbines, anomalies, forecast] = await Promise.all([
      turbineService.getTurbines('deviation'),
      anomalyService.getAnomalies('deviation'),
      forecastService.getForecast('deviation'),
    ])
    expect(turbines[0].status).toBe('normal')
    expect(turbines[1].status).toBe('deviation')
    expect(turbines[1].observed).toBeLessThan(turbines[1].expected * 0.6)
    expect(turbines[1].expected).toBe(forecast.records[0].WT02.prediction)
    expect(anomalies.filter((a) => a.active)).toHaveLength(1)
  })
  it('widens the expected range and lowers confidence when weather agreement is poor', async () => {
    const [normal, uncertain] = await Promise.all([
      forecastService.getForecast(),
      forecastService.getForecast('uncertainty'),
    ])
    expect(uncertain.confidence).toBeLessThan(normal.confidence)
    expect(uncertain.records[10].WT01.upper - uncertain.records[10].WT01.lower).toBeGreaterThan(
      normal.records[10].WT01.upper - normal.records[10].WT01.lower,
    )
  })
  it('replays exactly from a selected date and uses an earlier weather issue even across midnight', async () => {
    const replay = await replayService.run('2025-12-31', '00:05')
    expect(replay.origin).toBe('2025-12-31T00:05:00.000Z')
    expect(replay.forecast.records[0].timestamp).toBe(replay.origin)
    expect(Date.parse(replay.weatherIssuedAt)).toBeLessThan(Date.parse(replay.origin))
    expect(replay.weatherIssuedAt.slice(0, 10)).toBe('2025-12-30')
    expect(replay.leakageCheck).toBe(true)
  })
  it('grounds copilot answers in the selected scenario', async () => {
    const [forecast, turbines] = await Promise.all([
      forecastService.getForecast('deviation'),
      turbineService.getTurbines('deviation'),
    ])
    const answer = getCopilotAnswer('Are there any anomalies?', forecast, turbines)
    expect(answer.answer).toContain('observed 24%')
    expect(answer.answer).toContain('potential underperformance')
    expect(answer.references).toContain('Twin comparison')
    const confidence = getCopilotAnswer('Why is confidence lower?', forecast, turbines)
    expect(confidence.answer).toContain(`${forecast.confidence}/100`)
  })
  it('rejects impossible dates and future replay origins', async () => {
    await expect(replayService.run('2026-02-30', '08:00')).rejects.toThrow()
    await expect(replayService.run('2026-09-24', '08:00')).rejects.toThrow()
    await expect(replayService.run('2026-09-23', '18:00')).rejects.toThrow()
  })
})
