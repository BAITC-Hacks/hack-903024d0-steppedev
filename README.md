# WindOps AI

![WindOps AI dashboard demo](gif/firefox_EHElEHU6R6.gif)

**Agentic AI Wind Farm Forecasting Platform** — Predict. Understand. Act.

Responsive operator dashboard built with React, Vite, TypeScript, Tailwind CSS, shadcn-style Radix UI components, Lucide, Recharts, and Framer Motion.

## Run locally

Requires Node.js 22.12+ or 24 LTS.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). The application opens directly on the operator dashboard.

On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

## Demo flow

1. **Overview → Normal Operation:** view both turbine forecasts, expected ranges, confidence breakdown, current wind, and the last agent action.
2. **Demo Scenario → WT-02 Deviation:** open **Turbine Twin** to compare expected and observed output. The agent explains potential underperformance without diagnosing a fault.
3. **AI Agent → Simulate API failure:** watch retry, backup validation, recalculation, confidence adjustment, and publication.
4. **Simulate weather update:** revised weather fixtures change the output; the event stream records the change against the previous run.
5. **Historical Replay:** select **03 February 2026 / 08:00 UTC**, then run the forecast. The source issue is **07:42**, preceding the replay origin. Try another date or the day slider.
6. Click a forecast point for **Why this forecast?**, switch turbine, or inspect similar historical periods. **Ask WindOps AI** explains the displayed data.

Other scenarios include increased forecast uncertainty and historical mode. Forecast tables support CSV export. Notifications, settings, keyboard-accessible dialogs, mobile navigation, and reduced motion are implemented.

The interface supports **English, Русский, and Қазақша**. Use the language selector in the header or settings; the choice is saved on the device. On first use, the interface follows a supported browser language, falling back to English. Switching languages preserves the active scenario, forecasts, event history, and copilot conversation.

The overview starts with an operator brief: station condition, recommended action, and a shortcut to the relevant screen. Power is explicitly distinguished from energy, and the operator guide explains expected versus observed output, forecast ranges, confidence, and UTC timestamps. See [localization and operator interface](docs/LOCALIZATION.md) for maintenance details.

## Data and backend integration

This is a frontend demo. The operating clock is fixed to **23 September 2026, UTC**. Weather data, model results, explanation drivers, archive matches, and agent actions are simulated. Diagnostics explicitly labels example validation metrics. No Python inference runs in the browser.

All model fixture generation lives in `frontend/src/data/`. UI requests go through `frontend/src/services/api.ts`; replace the mock adapters with typed HTTP requests:

| Service                         | Future endpoint          |
| ------------------------------- | ------------------------ |
| `turbineService.getTurbines()`  | `GET /api/turbines`      |
| `weatherService.getWeather()`   | `GET /api/weather`       |
| `forecastService.getForecast()` | `GET /api/forecast`      |
| `anomalyService.getAnomalies()` | `GET /api/anomalies`     |
| `agentService.getStatus()`      | `GET /api/agent/status`  |
| `agentService.getHistory()`     | `GET /api/agent/history` |
| `replayService.run(date, time)` | `POST /api/replay`       |

Forecast values and ranges remain in **0–1** units in the service contract, then display as percentages. Confidence is an operational system indicator, not a statistical probability. Replay checks fixture issue timestamps; genuine leakage protection must also be enforced by the eventual archive/backend. The copilot uses deterministic data-grounded answers; no LLM is connected.

The Python modules now live under `backend/windops/`. The existing weather client, preparation pipeline, training code and agent are separate from the frontend. See [backend setup and commands](backend/README.md).

## Structure

```text
frontend/
  src/          React UI, pages, fixtures, services, state and types
  public/       static assets
  tests/        browser interaction and responsive checks
backend/
  windops/      core, data, weather, ml, agent and future API layer
  tests/        Python tests
storage/        local datasets, trained models, weather archives and exports
docs/           architecture and requirements
```

Frontend tooling and npm commands remain at the repository root. See the [structure and migration map](docs/ARCHITECTURE.md), [frontend guide](frontend/README.md), and [storage instructions](storage/README.md).

Large data and model files are kept locally in `storage/` and excluded from Git. Existing files were moved without altering their contents. Python storage paths are independent of the working directory and can be overridden with `WINDOPS_STORAGE_DIR`.

## Checks

```sh
npm run build
npm test
python -m unittest discover -s backend/tests -t .
npx playwright install chromium
npm run test:e2e
```

For browser tests, run `npm run dev` in another terminal first. To use an already installed Edge browser on Windows:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm.cmd run test:e2e
```

Unit checks cover data bounds, 48 consecutive forecast hours, uncertainty changes, deviation consistency, copilot grounding, and historical origin validation. Browser checks exercise the demo flow, CSV download, explanations, recovery, replay, notifications, mobile navigation, and overflow at mobile, tablet, and desktop widths.

Localization checks cover translation catalog parity, dynamic copilot responses, Russian and Kazakh question matching, language persistence, state preservation, and all six pages on mobile.
