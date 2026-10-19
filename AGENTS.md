# AGENTS.md

Orientation for coding agents (Claude Code, Codex, …) and new contributors. This is a map and a
set of rules, not implementation documentation: details live in the code and `README.md`.

## What this is

Frontend of the Digital Event Manager (DEM): a React 19 + TypeScript SPA built with Vite 7.
UI is MUI (`@mui/material`, `@mui/x-data-grid`), state is Redux Toolkit, routing is React Router 7,
forms are react-hook-form, styles are SCSS modules. It talks to the `dem-backend` API on the
relative path `/api/v1`.

Toolchain: **npm only** (`package-lock.json`), Node 22 (`.nvmrc`, `engines`). `@/*` is an alias
for `src/*` (Vite, all tsconfigs, ESLint resolver).

## Commands

```bash
npm ci                     # install
cp .env.example .env       # local config (defaults are fine)
npm run dev                # Vite dev server on :5173, proxies /api to the backend
npm run format:check       # Prettier (also checks .md files)
npm run lint               # ESLint; npm run lint:fix repairs import order etc.
npm run typecheck          # tsc -b
npm run build:prod         # what CI builds; output in dist/
npm run format             # Prettier --write
docker compose up --build  # nginx image on :8080, proxies /api to BACKEND_URL
```

There is no test runner. CI (`.github/workflows/ci.yml`) runs, in order:
`format:check` → `lint` → `typecheck` → `build:prod`; a Docker image is built on push to `main`.
Run the same four locally before pushing.

## Run modes and config

| Mode          | How                         | Backend address                                                                   |
| ------------- | --------------------------- | --------------------------------------------------------------------------------- |
| Dev (default) | `npm run dev`               | Vite proxy `/api` → `BACKEND_URL` from the shell, default `http://localhost:8000` |
| Container     | `docker compose up --build` | nginx proxy `/api` → `BACKEND_URL`, default `http://host.docker.internal:8000`    |

`BACKEND_URL` is a container / shell variable only; Vite does not read it from `.env`.

App settings (`src/config/app-config.ts`) are read at runtime from `window.__APP_CONFIG__`
(`public/config.js`, rendered from `public/config.template.js` when the container starts) and fall
back to Vite `import.meta.env`. Empty values count as unset.

| Key                       | Meaning                                                                                                                 | Default   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------- |
| `VITE_API_BASE_URL`       | axios base URL                                                                                                          | `/api/v1` |
| `VITE_ADMIN_PAGE_ENABLED` | `"true"` mounts `/admin/*`; otherwise it redirects to `/events`                                                         | off       |
| `VITE_AUTH_ENABLED`       | anything but `"false"` keeps auth on; when off, a fake "Local Admin" user is injected and the login redirect is skipped | on        |

## Where things live

```
src/index.tsx, src/App.tsx          entry; Provider → BrowserRouter → Header + Layout + LocalStorageSaver
src/api/axios.api.ts                the single axios instance; attaches Bearer token from localStorage
src/config/app-config.ts            apiBaseUrl, adminPageEnabled, authEnabled
src/constants/paths.ts              PATHS — the only place route strings are defined
src/constants/                      also events.ts (labels) and mockData.ts (mock events, see gaps)
src/services/<domain>Service.ts     one thin API wrapper per domain; maps responses, owns error messages
src/slices/<domain>Slice.ts         Redux Toolkit slices; createAsyncThunk over the services
src/store/store.ts                  combineReducers (keys are <domain>Reducer); typed hooks in src/hooks
src/types/                          API DTOs       src/interfaces/   domain models (IUser, IEvent)
src/routers/Router.tsx              lazy routes; /admin/* guarded by adminPageEnabled
src/containers/Layout.tsx           page shell
src/containers/helpers/             LocalStorageSaver (restores session), RedirectController (login redirect); render nothing
src/containers/pages/               route-level pages; Admin/pages/* are DataGrid CRUD screens
src/containers/Widgets/             larger composed blocks (HeaderBar, EventCard, UserCard, …)
src/components/                     small reusable pieces: forms, modals
src/styles/                         global.scss plus a few older *.module.scss
public/config.js, config.template.js  runtime config (dev placeholder / container template)
```

## Architecture rules (do not break)

```
components / pages  ->  slices (thunks)  ->  services  ->  api/axios.api.ts
```

- All HTTP goes through the shared axios instance; no `fetch`, no second instance.
- Route strings come from `PATHS`; never inline a path.
- Use `useAppDispatch` / `useAppSelector` from `src/hooks/redux_hooks.ts`, not the raw hooks.
- Tiers: `containers/pages` (one per route) → `containers/Widgets` (composed blocks) →
  `components` (reusable pieces). SCSS modules sit next to the component that uses them.
- New page checklist: path in `src/constants/paths.ts` → page in `src/containers/pages/` → lazy route in
  `src/routers/Router.tsx` → if it needs data: `types/` → `services/` → `slices/` → reducer in
  `store/store.ts`.

## Quality bar

- Prettier with default settings; it covers `.md` too, so keep this file formatted.
- ESLint (`eslint.config.js`): `@typescript-eslint/consistent-type-imports` is an **error** — type
  imports go in a separate `import type` statement. `import/order` is an **error** with strict groups
  (`react` first, then external, `@/**` internal, parent, sibling), blank line between groups,
  alphabetized. `npm run lint:fix` repairs both.
- `tsc -b` is strict; unused vars warn unless prefixed with `_`.
- Commits: Conventional Commits in English (`feat:`, `fix:`, `docs:`, `build:`, `ci:`, …).

## Known gaps (as of 2026-10)

- **Auth contract does not match the backend.** The UI calls `/auth/register`, `/auth/login` with
  email + password, `/auth/logout`, `/auth/refresh_tokens` and `/users/`. The backend is
  passwordless (`/auth/request-code` → `/auth/login` with a code) and has `/people`, not `/users`.
  Logging in against the real API does not work yet.
- Event pages (`src/containers/pages/Events/*`) render `src/constants/mockData.ts`; there is no event
  service or slice.
- `src/services/eventApplicationService.ts` is a stub: the backend has no applications endpoint.
- No tests of any kind.

## Keeping this file current

Update `AGENTS.md` in the same PR whenever you add or move a top-level folder under `src/`, change
a command, a run mode, a config key, an architecture rule or close a known gap. Keep it a map plus
rules: no component props, no slice internals, no step-by-step implementation notes. Do not
duplicate `README.md`; link to it instead.
