export type Scenario = 'normal' | 'weather-update' | 'deviation' | 'api-failure' | 'uncertainty' | 'replay'
export type Page = 'overview' | 'forecast' | 'twin' | 'agent' | 'replay' | 'diagnostics'
export interface PowerForecast { prediction: number; lower: number; upper: number; confidence: number }
export interface ForecastRecord {
  timestamp: string
  windSpeed10m: number
  windSpeed80m: number
  windSpeed120m: number
  windDirection: number
  gusts: number
  temperature: number
  pressure: number
  WT01: PowerForecast
  WT02: PowerForecast
}
export interface ConfidenceFactors { weatherData: number; modelStability: number; twinConsistency: number; dataFreshness: number; forecastAgreement: number }
export interface ForecastResponse { records: ForecastRecord[]; confidence: number; factors: ConfidenceFactors; source: string; issuedAt: string; nextUpdate: string; scenario: Scenario }
export interface AppNotification { id: string; title: string; description: string; severity: 'Info' | 'Warning' | 'Critical'; time: string; read: boolean }
export interface ReplayResult { forecast: ForecastResponse; origin: string; weatherIssuedAt: string; leakageCheck: boolean }
