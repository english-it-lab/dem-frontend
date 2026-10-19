# Фронтенд

SPA на `React 19 + TypeScript + Vite 7`. UI — MUI, состояние — Redux Toolkit, стили — SCSS modules, проверка кода — ESLint + Prettier.

## Требования

- `Node.js 22+` (версия закреплена в `.nvmrc`, `nvm use`)
- `npm 10+`
- Docker — только для запуска production-образа

## Быстрый старт

```bash
npm ci
cp .env.example .env
npm run dev
```

Dev-сервер поднимается на `http://localhost:5173` и проксирует `/api` на бэкенд (`BACKEND_URL`, по умолчанию `http://localhost:8000`). Бэкенд запускается из репо `dem-backend` (см. его README).

## Режимы запуска

| Режим                    | Команда                     | Куда уходят запросы `/api`                                                                   |
| ------------------------ | --------------------------- | -------------------------------------------------------------------------------------------- |
| Dev с hot-reload         | `npm run dev`               | Vite proxy → `BACKEND_URL` (бэкенд локально или в compose)                                   |
| Production-образ (nginx) | `docker compose up --build` | nginx proxy → `BACKEND_URL` (по умолчанию `host.docker.internal:8000`, т.е. бэкенд на хосте) |

Браузер в обоих режимах ходит на относительный путь `/api/v1`, поэтому CORS не нужен. Если бэкенд в другом compose-проекте на этой же машине, ничего менять не надо: он публикует порт `8000` на хост. `host.docker.internal` на Linux требует Docker 20.10+ (маппинг задан в `docker-compose.yml`).

## Переменные окружения

Задаются в `.env` (dev) или через окружение контейнера. Образ один на все окружения: значения подставляются в `config.js` при старте контейнера.

| Переменная                | По умолчанию                                                               | Назначение                                                             |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `VITE_API_BASE_URL`       | `/api/v1`                                                                  | Базовый путь API. Абсолютный URL — только если прокси не используется. |
| `BACKEND_URL`             | `http://localhost:8000` (dev) / `http://host.docker.internal:8000` (образ) | Куда прокси отправляет `/api`.                                         |
| `VITE_ADMIN_PAGE_ENABLED` | `false`                                                                    | `true` — включить маршруты `/admin`.                                   |
| `VITE_AUTH_ENABLED`       | `true`                                                                     | `false` — отключить авторизацию (подставляется локальный админ).       |
| `FRONTEND_PORT`           | `8080`                                                                     | Порт контейнера на хосте (только `docker compose`).                    |

## Команды

```bash
npm run dev            # dev-сервер Vite
npm run build          # production-сборка (tsc -b && vite build)
npm run preview        # локальный просмотр сборки из dist/
npm run typecheck      # tsc -b
npm run lint           # ESLint; lint:fix — с автоисправлением
npm run format:check   # Prettier; format — записать изменения
```

CI на PR выполняет `format:check`, `lint`, `typecheck`, `build:prod` — прогоняйте локально перед пушем.

## Docker

```bash
docker compose up --build                      # nginx на http://localhost:8080
BACKEND_URL=http://api:8000 docker compose up  # бэкенд в той же docker-сети
docker build -t dem-frontend . && docker run --rm -p 8080:80 dem-frontend
```

## Структура

- `src/api/` — axios-инстанс (base URL, токен)
- `src/services/` — вызовы API по доменам
- `src/slices/`, `src/store/` — Redux Toolkit
- `src/containers/pages/` — страницы (маршруты в `src/routers/Router.tsx`), `src/containers/Widgets/` — крупные блоки, `src/components/` — переиспользуемые части
- `src/config/app-config.ts` — чтение переменных окружения
- `public/config.template.js` — шаблон runtime-конфига для контейнера
