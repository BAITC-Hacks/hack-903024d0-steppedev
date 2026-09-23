import type { Anomaly } from '../types/turbine'
export const mockAnomalies: Anomaly[] = [
  { id: 'a1', date: '2026-09-14', turbine: 'WT-02', title: 'Potential underperformance', duration: '2h 20m', active: false },
  { id: 'a2', date: '2026-09-07', turbine: 'WT-01', title: 'Power deviation', duration: '40m', active: false },
  { id: 'a3', date: '2026-08-31', turbine: 'WT-02', title: 'Unexpected output pattern', duration: '1h 10m', active: false },
]
