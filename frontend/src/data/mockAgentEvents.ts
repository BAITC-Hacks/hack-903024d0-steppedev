import type { AgentEvent } from '../types/agent'
export const mockAgentEvents: AgentEvent[] = [
  {
    id: 'e1',
    time: '13:42:03',
    title: 'Weather forecast received',
    detail: '48/48 hourly records validated',
    status: 'completed',
    stage: 'Weather',
  },
  {
    id: 'e2',
    time: '13:42:05',
    title: 'Data preparation completed',
    detail: 'No missing critical features',
    status: 'completed',
    stage: 'Feature Preparation',
  },
  {
    id: 'e3',
    time: '13:43:07',
    title: 'Forecast calculated',
    detail: 'WT-01 and WT-02 · 48-hour horizon',
    status: 'completed',
    stage: 'Forecast',
  },
  {
    id: 'e4',
    time: '13:43:11',
    title: 'Twin analysis completed',
    detail: 'No abnormal turbine divergence',
    status: 'completed',
    stage: 'Twin Analysis',
  },
  {
    id: 'e5',
    time: '13:44:13',
    title: 'Forecast published',
    detail: 'Confidence 94/100 · ready for operations',
    status: 'completed',
    stage: 'Publish',
  },
]
