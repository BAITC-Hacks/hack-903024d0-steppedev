import type { ForecastRecord } from '../types/forecast'

export function makeExplanation(record: ForecastRecord, turbine: 'WT01' | 'WT02') {
  const power = record[turbine]
  return {
    drivers: [
      { label: 'Wind speed 120m', note: 'Strong positive impact', value: 88, negative: false },
      { label: 'Wind speed 80m', note: 'Positive impact', value: 64, negative: false },
      { label: 'Wind direction', note: 'Moderate negative impact', value: 35, negative: true },
      { label: 'Temperature', note: 'Low impact', value: 12, negative: false },
    ],
    historicalCount: 327,
    historicalAverage: Math.min(1, power.prediction + 0.02),
    historicalLower: power.lower,
    historicalUpper: power.upper,
    periods: [7, 28, 63].map((days, index) => ({
      timestamp: new Date(Date.parse(record.timestamp) - days * 86400000).toISOString(),
      power: Math.max(0, Math.min(1, power.prediction + (index - 1) * 0.02)),
    })),
  }
}
