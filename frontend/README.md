# WindOps frontend

```text
frontend/
  src/
    components/  переиспользуемые UI-компоненты
    pages/       шесть операторских экранов
    data/        demo fixtures
    services/    интерфейс подключения будущего backend
    state/       общий state и демо-сценарии
    types/       TypeScript-контракты
    lib/         вспомогательные функции
  public/        статические файлы
  tests/         браузерные проверки
  index.html     точка входа Vite
  components.json
```

`package.json`, `package-lock.json`, Vite, TypeScript и Playwright config находятся в корне репозитория. Устанавливать второй `node_modules` в этой папке не нужно.

Все команды запускаются из корня:

```sh
npm install
npm run dev
npm run build
npm test
npm run test:e2e
```

Production-сборка сохраняется в корневой `dist/`. Playwright ожидает работающий dev server. API-адаптер: `frontend/src/services/api.ts`. Вызовы Python, модели и тяжёлые датасеты относятся к `backend/` и `storage/`.
