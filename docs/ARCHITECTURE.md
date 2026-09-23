# Организация проекта

```text
WindOps AI/
  frontend/              React-приложение, UI, fixtures и browser tests
  backend/               Python-пакет и его тесты
  storage/               локальные данные, модели и результаты (ignored)
  docs/                  архитектура, требования и документация
  package.json           единые команды frontend из корня
  package-lock.json      зафиксированные зависимости frontend
  vite.config.ts         root = frontend, output = dist
  tsconfig*.json         настройки TypeScript
  playwright.config.ts   browser tests из frontend/tests
```

## Границы ответственности

Frontend визуализирует сервисные ответы. Он не импортирует Python и не читает локальные ML-датасеты. Пока ответы заменяются mock adapters в `frontend/src/services/api.ts`.

Backend отвечает за погодные данные, подготовку измерений, ML и аналитического агента. Его общий модуль `backend/windops/core/paths.py` задаёт стабильные пути. Будущий FastAPI-слой размещается в `backend/windops/api/`; сервер пока не создан.

Storage содержит данные, которые обновляются при запуске pipeline и могут быть большими. В `backend/windops/ml/` лежит код модели, а в `storage/models/` — обученные веса и связанные результаты.

## Карта переноса

| Раньше                          | Теперь                                |
| ------------------------------- | ------------------------------------- |
| `src/`, `public/`, `index.html` | `frontend/`                           |
| `tests/dashboard.spec.ts`       | `frontend/tests/dashboard.spec.ts`    |
| `task/prepare_data.py`          | `backend/windops/data/preparation.py` |
| `task/train_model.py`           | `backend/windops/ml/training.py`      |
| `task/weather_api.py`           | `backend/windops/weather/client.py`   |
| `task/ai_agent.py`              | `backend/windops/agent/analysis.py`   |
| `task/data/turbine_*.csv`       | `storage/data/raw/`                   |
| `task/data/processed/`          | `storage/data/processed/`             |
| `task/models/`                  | `storage/models/`                     |
| `task/weather_snapshots/`       | `storage/weather/`                    |
| `task/wind_forecast.csv`        | `storage/forecasts/wind_forecast.csv` |

## Команды

Frontend: `npm run dev`, `npm run build`, `npm test` из корня, как раньше.

Python: `python -m backend.windops.data.preparation`, `python -m backend.windops.ml.training`, `python -m backend.windops.weather.client` из корня после установки зависимостей. Эти команды явно запускают подготовку, обучение или сеть; импорт пакета этого не делает.

Тесты путей: `npm run test:backend` или `python -m unittest discover -s backend/tests -t .`.
