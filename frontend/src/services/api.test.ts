import { afterEach, describe, expect, it, vi } from 'vitest'
import { forecastService, operationsService, replayService } from './api'
afterEach(() => vi.unstubAllGlobals())
describe('Real API adapter', () => {
  it('uses the operations endpoint and returns its data unchanged', async () => {
    const body = { forecast: null, error: 'Weather unavailable', connected: true }
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)))
    vi.stubGlobal('fetch', fetch)
    expect(await operationsService.getSnapshot()).toEqual(body)
    expect(fetch.mock.calls[0][0]).toBe('/api/operations')
  })
  it('does not substitute artificial forecasts when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(forecastService.getForecast()).rejects.toThrow('Cannot connect')
  })
  it('preserves server validation errors on historical requests', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Origin precedes training cutoff' }), { status: 422 }),
      )
    vi.stubGlobal('fetch', fetch)
    await expect(replayService.run('2026-01-20', '08:00')).rejects.toThrow('Origin precedes training cutoff')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ date: '2026-01-20', time: '08:00' })
  })
  it('requests a real server refresh using POST', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ started: true, busy: true })))
    vi.stubGlobal('fetch', fetch)
    await forecastService.refresh()
    expect(fetch.mock.calls[0][0]).toBe('/api/forecast/refresh')
    expect(fetch.mock.calls[0][1].method).toBe('POST')
  })
})
