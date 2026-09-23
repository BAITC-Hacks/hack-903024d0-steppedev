export interface Turbine { id: 'WT-01' | 'WT-02'; name: string; wind: number; direction: number; temperature: number; expected: number; observed: number; confidence: number; status: 'normal' | 'deviation' }
export interface Anomaly { id: string; date: string; turbine: string; title: string; duration: string; active: boolean }
