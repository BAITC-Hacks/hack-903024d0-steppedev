# WindOps Python backend

Python-код разделён по назначению. Это существующие скрипты проекта, организованные в пакет; HTTP-сервер пока не реализован.

```text
backend/
  windops/
    core/paths.py         единые пути к данным и артефактам
    data/preparation.py   загрузка CSV, очистка, почасовые данные и признаки времени
    weather/client.py     Open-Meteo, проверка ответа, сохранение погодных снимков
    ml/training.py        обучение CatBoost, validation, метрики и сохранение модели
    agent/analysis.py     существующий клиент аналитического агента
    api/                  место для будущих FastAPI routes и schemas
  tests/                  проверки Python-части
  requirements.txt        зависимости существующих модулей
  .env.example            пример переменных окружения
```

## Установка и запуск

Команды выполняются из корня репозитория. Для отдельного Python-окружения:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
```

Подготовка данных:

```powershell
backend/.venv/Scripts/python.exe -m backend.windops.data.preparation
```

Обучение модели — отдельная длительная операция, запускается явно:

```powershell
backend/.venv/Scripts/python.exe -m backend.windops.ml.training
```

Загрузка текущего прогноза погоды — обращается к Open-Meteo:

```powershell
backend/.venv/Scripts/python.exe -m backend.windops.weather.client
```

На macOS/Linux путь интерпретатора окружения — `backend/.venv/bin/python`. Если зависимости уже установлены в активном окружении, используйте обычный `python`.

Запускайте модули через `-m`, а не прямым путём к `.py`: это сохраняет корректность импортов пакета. Из папки `backend/` допустим короткий вариант `python -m windops.data.preparation` и аналогичные команды для остальных модулей.

## Файлы данных

По умолчанию все пути определяет `windops/core/paths.py`:

| Что                                        | Где                                               |
| ------------------------------------------ | ------------------------------------------------- |
| Исходные измерения                         | `storage/data/raw/turbine_1.csv`, `turbine_2.csv` |
| Почасовые данные                           | `storage/data/processed/hourly_training.csv`      |
| Модели и metadata                          | `storage/models/`                                 |
| Исходные погодные ответы и CSV по запускам | `storage/weather/<timestamp>/`                    |
| Экспортированные прогнозы                  | `storage/forecasts/`                              |
| Будущие отчёты                             | `storage/reports/`                                |

Эти пути не зависят от текущей рабочей папки. Для больших данных можно задать отдельный диск:

```powershell
$env:WINDOPS_STORAGE_DIR = 'D:\WindOpsData'
```

Тогда внутри `D:\WindOpsData` ожидается та же структура `data/raw`, `data/processed`, `models`, `weather`. Относительное значение переменной разрешается относительно корня репозитория. `.env.example` — документация: автоматическая загрузка `.env` пока не добавлена.

Агент читает `NVIDIA_API_KEY` из окружения. В существующем `agent/analysis.py` ещё указан `MODEL_NAME`; для настоящего вызова необходимо выбрать модель. Реорганизация не подключает этот клиент к frontend и не отправляет прогнозы во внешний сервис.

## Как расширять

- Загрузку и проверку новых источников размещать в `weather/` и `data/`.
- При росте ML-кода выделять признаки, обучение, оценку и inference в отдельные модули внутри `ml/`.
- Решения агента и его workflow хранить в `agent/`; HTTP routes должны только вызывать сервисы.
- Общие настройки и инфраструктуру хранить в `core/`.
- Модели, CSV, parquet и другие большие артефакты хранить в `storage/`, а не рядом с Python-кодом.
- Не запускать обучение или сетевые запросы при импорте модулей. Существующие CLI защищены `if __name__ == '__main__'`.

## Проверки без сети и обучения

Из корня репозитория:

```sh
python -m unittest discover -s backend/tests -t .
```

Эти тесты проверяют маршрутизацию файлов и не требуют pandas/CatBoost. При реорганизации обучение модели и внешние API не запускались; алгоритмы сохранены, изменены расположение файлов, импорты путей и документация.
