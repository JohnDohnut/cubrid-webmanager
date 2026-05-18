# CUBRID Web Manager

CUBRID Web Manager is a modern web application for administering CUBRID databases. It talks to CUBRID Manager Server (CMS) on managed hosts and exposes a React UI backed by a NestJS API.

This repository is an [Nx](https://nx.dev/) monorepo with a shared root `package.json`, shared TypeScript contracts in `libs/api-interfaces`, and three deployable applications: the web UI, the API server, and an Electron desktop launcher (phase 1 / MVP).

## Repository layout

```text
cubrid-webmanager/
├── apps/
│   ├── web-manager/     # React + Vite frontend (PWA-capable)
│   ├── api-server/      # NestJS HTTPS API and CMS integration
│   └── desktop/         # Electron main/preload; bundles UI + API for local use
├── libs/
│   ├── api-interfaces/  # Shared request/response TypeScript types
│   └── ui-components/   # Reserved for shared UI (placeholder)
├── data/                # Local desktop secrets and runtime data (git-ignored contents)
├── docs/                # Architecture notes (including desktop MVP spec)
├── dist/                # Build outputs (generated)
├── tools/               # Local HTTPS/proxy helpers for web development
└── package.json         # Root dependencies and npm scripts
```

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite 7, Ant Design, Redux Toolkit, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript, Passport JWT, encrypted file storage |
| Desktop | Electron 35 (dev dependency at repo root) |
| Tooling | Nx 22, Jest, ESLint, Webpack (API), `pkg` (optional API executables) |

## Prerequisites

- Node.js 20+ (aligned with the repo’s `@types/node` and `pkg` targets)
- npm (install from the repository root)

## Install

```bash
npm install
```

## Development

### Web UI only (Vite dev server)

```bash
npm run dev:web-manager
# or: nx dev web-manager
```

The UI uses build-time Vite variables such as `VITE_API_BASE_URL` when present. In the browser, point the UI at your API base URL (for example `https://localhost:8080`) or use the HTTPS helper scripts below.

### API server only

Build once, then serve the compiled entrypoint:

```bash
npm run build:api-server
npm run dev:api-server
```

`nx serve api-server` runs `node dist/apps/api-server/main.js` from the workspace root.

#### API configuration

The API reads configuration at **process startup**. Values are **not** baked into `main.js`.

1. Optional env files are loaded by `loadRuntimeEnv()` (see `apps/api-server/src/config/load-runtime-env.ts`).
2. `ConfigService` resolves settings from **CLI flags** (`--KEY=value`) and **`process.env`**, with CLI taking precedence where both exist.

Copy `apps/api-server/.env.example` to `.env` at the repo root or under `apps/api-server/` for local development. At minimum, set:

- `SEED` and `SALT` — inputs to the storage encryption key (required)
- `ENVIRONMENT` — `development` or `production`
- `PORT` — listen port (default `8080`)
- `ALLOWED_ORIGINS` — required in production for CORS (comma-separated)

Other notable variables include `CMS_REJECT_UNAUTHORIZED`, `CMS_FORWARD_ENABLED`, `AUTH_REGISTRATION_ENABLED`, and TLS paths `SSL_CERT_PATH` / `SSL_KEY_PATH` for production.

In non-production, the server can generate self-signed TLS material under `apps/api-server/ssl/` when PEM paths are not provided.

Example with explicit CLI overrides:

```bash
node dist/apps/api-server/main.js --SEED=seed --SALT=salt --PORT=8080 --ALLOWED_ORIGINS=http://localhost:5173
```

### HTTPS web + API (local stack)

Helper scripts under `tools/` can run the built web UI with HTTPS and proxy to the API. See `package.json` scripts such as:

- `npm run dev:web-manager:https:stack`
- `npm run serve:web-manager:https-proxy`

Use `npm run ssl:local-prod` to generate local production-style certificates when needed.

### Desktop (Electron)

The desktop app loads the **built** web UI over the custom `app://` protocol, spawns the **built** API as a child process on a **Unix domain socket** (named pipe on Windows), and injects `apiBaseUrl` into the renderer through a thin preload (`window.desktopConfig`).

```bash
npm run dev:desktop
```

This target builds `desktop`, `api-server`, and the Electron-specific `web-manager` build (`build-electron` uses `vite build --mode=electron` for macOS/Linux/Windows), then runs Electron via `npx electron apps/desktop`.

Portable folder output (unpacked app directory):

```bash
npm run package:desktop
```

Packaging can take several minutes while `api-server/node_modules` is copied into the app bundle. On macOS you may see `skipped macOS notarization` — that is expected for unsigned local builds.

Artifacts are written under `dist/portable/`:

- macOS: `dist/portable/mac-arm64/CUBRID Web Manager.app` (or `mac/` / `mac-x64` depending on the build machine)
- Windows: `dist/portable/win-unpacked/CUBRID Web Manager.exe`
- Linux: `dist/portable/linux-unpacked/` (executable name matches `productName`)

Run the generated app from that folder. Portable layout next to the app (same on macOS, Windows, Linux — not under Library/AppData):

- `desktop-settings.json` — in the same folder as the `.app` (macOS) or `.exe` (Windows/Linux), not inside the bundle
- `cwm-vault/secrets.json` — SEED/SALT (outside `cwm-workspace/`)
- `cwm-workspace/` — default data directory (`data/`, `ssl/`, storage, `api.sock` on Unix)

Runtime notes:

- Renderer static files: `dist/apps/web-manager` in development; `resources/web-manager` when packaged
- API entry: `dist/apps/api-server/main.js` in development; `resources/api-server/main.js` when packaged
- API child env: `CWM_DESKTOP=1`, `LISTEN_UNIX_SOCKET=<data>/api.sock`, `STORAGE_PATH=<portable>/data/storage`, `ALLOWED_ORIGINS=app://.`
- Desktop waits for API readiness before opening the main window
- Phase 1 does **not** include code signing, a first-run wizard, or OS keychain integration

See [docs/electron-desktop-spec.en.md](./docs/electron-desktop-spec.en.md) (Korean: [docs/electron-desktop-spec.ko.md](./docs/electron-desktop-spec.ko.md)).

**Configuration models differ by app:**

| App | How settings are supplied |
|-----|---------------------------|
| `api-server` | Runtime `.env` / environment / CLI (`--KEY=value`) |
| `web-manager` (web deploy) | Build-time `VITE_*` or same-origin `/api` reverse proxy |
| `desktop` | Main process `spawn` env for the API; preload for `apiBaseUrl` only |

## Build

```bash
# Everything
npm run build

# Per project
npm run build:web-manager
nx run web-manager:build-electron
npm run build:api-server
nx build desktop
```

Outputs:

- Web UI: `dist/apps/web-manager`
- API: `dist/apps/api-server`
- Desktop main/preload: `dist/apps/desktop`

## Test, lint, and CI

```bash
npm run test
npm run lint
npm run typecheck:api-server
npm run ci
```

Project-scoped commands are available, for example `npm run test:api-server` and `npm run lint:web-manager`.

## Packaging the API with `pkg`

Optional single-file executables for the API server:

```bash
npm run pkg:api-server          # all platforms (per root pkg config)
npm run pkg:api-server:windows
npm run pkg:api-server:linux
npm run pkg:api-server:macos
```

Artifacts are written under `dist/executables/`. Run with the same `SEED`, `SALT`, and `PORT` requirements as the Node entrypoint. Place env files next to the binary or inject environment variables as documented in `apps/api-server/.env.example`.

## Shared API contracts

HTTP request and response shapes shared between the frontend and backend live in `libs/api-interfaces`. Import from `@api-interfaces` in application code. See [libs/api-interfaces/README.md](./libs/api-interfaces/README.md).

## Nx monorepo notes

- Dependencies are installed once at the repository root.
- Each app defines targets in its own `project.json` (or via Nx plugins for Vite/Webpack).
- TypeScript path aliases for the API are listed under `_moduleAliases` in the root `package.json` and resolved at build time for the server bundle.

## Documentation

- [Electron desktop MVP spec (English)](./docs/electron-desktop-spec.en.md)
- [Electron desktop MVP spec (Korean)](./docs/electron-desktop-spec.ko.md)

## License

See the repository license file if present. Otherwise, refer to your organization’s distribution terms for CUBRID Web Manager.
