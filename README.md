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

Set `VITE_API_BASE_URL=/api` when building for the [HTTPS stack](#https-web--api-local-stack) so the UI calls same-origin `/api/...`. Without it, the dev build defaults to `https://localhost:8080` (cross-origin, CORS required).

### API server only

Build once, then serve the compiled entrypoint:

```bash
npm run build:api-server
npm run dev:api-server
```

`nx serve api-server` runs `node dist/apps/api-server/main.js` from the workspace root.

Copy `apps/api-server/.env.example` to `apps/api-server/.env` (or the repo root `.env`). At minimum set `SEED`, `SALT`, and `ENVIRONMENT`. See [Environment variables](#environment-variables) for the full list.

Example with CLI overrides (CLI wins over env):

```bash
node dist/apps/api-server/main.js --SEED=seed --SALT=salt --PORT=8080 --ALLOWED_ORIGINS=https://localhost
```

### HTTPS web + API (local stack)

`npm run dev:web-manager:https:stack` runs **two processes** via `tools/run-web-manager-https-stack.js`:

1. **API** — `npm run dev:api-server` (NestJS on port `8080` by default)
2. **HTTPS front door** — `tools/serve-web-manager-https-proxy.js` serves the **built** UI and proxies `/api/*` → `https://127.0.0.1:8080/*`

Use this when you want the browser on a **single origin** (for example `https://localhost`) without CORS between UI and API.

**Prerequisites**

```bash
npm run ssl:local-prod
VITE_API_BASE_URL=/api npm run build:web-manager
```

**Run**

```bash
npm run dev:web-manager:https:stack        # HTTPS on 443
npm run dev:web-manager:https:stack:4200   # if 443 is in use or needs elevated privileges
```

Open `https://localhost` (or `https://localhost:4200`). API calls should go to `/api/...` (same origin).

**Related scripts**

| Script | Purpose |
|--------|---------|
| `npm run serve:web-manager:https-proxy` | HTTPS UI + `/api` proxy only (API must already be running) |
| `npm run serve:web-manager:dist` | Static UI over HTTP only (no API proxy) |

Env for the stack and proxy is loaded from `apps/api-server/.env` (see [HTTPS stack / proxy tools](#https-stack--proxy-tools-tools)).

**Local `ENVIRONMENT=production` example** (`apps/api-server/.env`):

```env
ENVIRONMENT=production
SEED=seed
SALT=salt
PORT=8080
ALLOWED_ORIGINS=https://localhost,https://127.0.0.1
AUTH_REGISTRATION_ENABLED=true
CWM_TRUST_LOCAL_PROXY=1
PROXY_INSECURE_TLS=1
API_TARGET=https://127.0.0.1:8080
SSL_CERT_PATH=apps/api-server/ssl/cert.pem
SSL_KEY_PATH=apps/api-server/ssl/key.pem
```

Do **not** run `node dist/apps/api-server/main.js` in a separate terminal when using the stack — use the stack alone so port `443`/`4200` and `8080` stay in sync.

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

## Environment variables

Configuration is read at **process startup** (not baked into bundles). For `api-server`, CLI flags `--KEY=value` override env when both are set.

### How env files are loaded (`api-server`)

Implemented in `apps/api-server/src/config/load-runtime-env.ts`. The **first existing file** wins (not merged):

| `ENVIRONMENT` | Search order |
|---------------|--------------|
| `production` | `/etc/cubrid-webmanager.env` → `apps/api-server/.env` → repo root `.env` |
| `development` | repo root `.env` → `apps/api-server/.env` |

Skipped when `CWM_DESKTOP=1` (Electron injects env via `spawn`).

`tools/load-workspace-env.js` (HTTPS stack / proxy) loads: `apps/api-server/.env` → repo root `.env` → `/etc/cubrid-webmanager.env`.

### `api-server` runtime

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEED` | **Yes** | — | Input to PBKDF2 storage encryption key. Changing it invalidates existing encrypted storage. |
| `SALT` | **Yes** | — | Salt for PBKDF2. Keep stable per deployment. |
| `ENVIRONMENT` | No | `development` | `development` or `production`. Alias via CLI: `--ENV=` or `--ENVIRONMENT=`. |
| `PORT` | No | `8080` | HTTPS listen port for the API. |
| `ALLOWED_ORIGINS` | Production | empty | Comma-separated browser origins for CORS (no spaces after commas). Ignored in `development` (`*` used). Example: `https://localhost` for `https://localhost` on port 443 (Origin has no port). |
| `AUTH_REGISTRATION_ENABLED` | No | `true` in dev, `false` in prod | Allow `POST /auth/register`. Use `true`/`false`/`1`/`0`. |
| `CMS_REJECT_UNAUTHORIZED` | No | `true` in prod, `false` in dev | Reject invalid TLS certificates when calling CMS hosts. |
| `CMS_FORWARD_ENABLED` | No | `false` in prod, `true` in dev | Enable CMS HTTPS forward proxy endpoints. |
| `CMS_CA_CERT_PATH` | No | — | PEM file for CMS TLS trust store. |
| `SSL_CERT_PATH` | Production | — | API HTTPS certificate PEM. Relative paths resolve from repo root. |
| `SSL_KEY_PATH` | Production | — | API HTTPS private key PEM. |
| `CWM_SSL_DIR` | No | `apps/api-server/ssl` (dev) | Directory for auto-generated self-signed certs when PEM paths are not set. |
| `SERVER_IP` | No | — | Extra IP SAN when generating self-signed certs. |
| `STORAGE_PATH` | No | `apps/api-server/storage` (dev) | Encrypted user/host storage directory. |
| `LISTEN_HOST` / `HOST` | No | all interfaces | Bind address for TCP listen. |
| `LISTEN_UNIX_SOCKET` | No | — | Unix socket (or Windows named pipe) instead of TCP. Used by desktop. |
| `CWM_DESKTOP` | No | — | Set to `1` by Electron. Skips dotenv load; desktop-specific CORS rules. |
| `CWM_TRUST_LOCAL_PROXY` | No | — | Set to `1` to allow production CORS requests with no `Origin` header (local HTTPS reverse proxy). **Do not enable on public deployments.** |

**CLI equivalents** (same names): `--SEED=`, `--SALT=`, `--PORT=`, `--ALLOWED_ORIGINS=`, `--LISTEN_HOST=`, `--LISTEN_UNIX_SOCKET=`, `--AUTH_REGISTRATION_ENABLED=`, `--CMS_REJECT_UNAUTHORIZED=`, `--CMS_FORWARD_ENABLED=`, `--CMS_CA_CERT_PATH=`.

**Behavior notes**

- `development`: CORS allows all origins; self-signed API TLS is auto-created under `CWM_SSL_DIR` if `SSL_*_PATH` are missing.
- `production`: CORS uses `ALLOWED_ORIGINS` only; `SSL_CERT_PATH` and `SSL_KEY_PATH` are required.

### HTTPS stack / proxy tools (`tools/`)

Used by `serve-web-manager-https-proxy.js` and `run-web-manager-https-stack.js`. Read from `apps/api-server/.env` when present.

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_HTTPS_PORT` | `443` | Port for the HTTPS UI + `/api` proxy. Override with `npm run dev:web-manager:https:stack:4200` (argument `4200`). |
| `API_TARGET` | `https://127.0.0.1:8080` | Upstream API base URL. `/api` prefix is stripped before forward. |
| `PROXY_INSECURE_TLS` | `0` | Set to `1` to skip TLS verification to the API (needed for local self-signed API certs). |
| `BUILD_DIR` | `dist/apps/web-manager` | Built static web UI directory. |
| `SSL_CERT_PATH` | `apps/api-server/ssl/cert.pem` | HTTPS certificate for the **proxy** (often same files as the API). |
| `SSL_KEY_PATH` | `apps/api-server/ssl/key.pem` | HTTPS private key for the proxy. |
| `API_START` | `dev:api-server` | npm script name started by the stack (stack runner only). |
| `API_WAIT_HOST` | `127.0.0.1` | Host to poll before starting the proxy (stack runner only). |
| `API_WAIT_PORT` | `8080` or `PORT` | Port to poll before starting the proxy (stack runner only). |
| `API_WAIT_TIMEOUT_MS` | `120000` | Max wait for API readiness in ms (stack runner only). |

Also inherits `ENVIRONMENT`, `SEED`, `SALT`, etc. when the stack starts `dev:api-server`.

### `web-manager` (build-time)

Vite embeds these at **build** time (restart dev server or rebuild after changes).

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://localhost:8080` (if unset at build) | Axios `baseURL`. Use `/api` for same-origin HTTPS proxy deployments. |

```bash
VITE_API_BASE_URL=/api npm run build:web-manager
```

Electron builds use `vite build --mode=electron`; the desktop preload supplies `window.desktopConfig.apiBaseUrl` instead.

### Desktop (`apps/desktop`)

Set by the Electron main process when spawning the API (see `apps/desktop/src/api/api-process.ts`). Override only for debugging.

| Variable | Typical value | Description |
|----------|---------------|-------------|
| `CWM_DESKTOP` | `1` | Desktop mode; skips file-based env load in the API. |
| `ENVIRONMENT` | `development` | API mode for bundled desktop runs. |
| `LISTEN_UNIX_SOCKET` | `<workspace>/api.sock` | API listens on a socket, not TCP. |
| `STORAGE_PATH` | `<workspace>/data/storage` | Portable storage path. |
| `CWM_SSL_DIR` | `<workspace>/ssl` | SSL directory for the API child. |
| `ALLOWED_ORIGINS` | `app://.` | CORS origin for the custom `app://` protocol. |
| `SEED` / `SALT` | from `cwm-vault/secrets.json` | Encryption secrets (not in `.env`). |
| `CWM_DESKTOP_ALLOWED_ORIGIN` | — | Optional override for desktop CORS origin (main process). |

### Deployment scripts (`scripts/`)

These **`CWM_*` variables are for install/deploy scripts only** (`deploy-cubrid-webmanager.sh`, `setup-runtime-from-dist.sh`). They are written into `/etc/cubrid-webmanager.env` as standard `api-server` variables, not read directly by the API at runtime unless exported there.

| Variable | Default | Description |
|----------|---------|-------------|
| `CWM_INSTALL_ROOT` | `/opt/cubrid-webmanager` | Install directory on the server. |
| `CWM_ENV_FILE` | `/etc/cubrid-webmanager.env` | Generated API env file path. |
| `CWM_SSL_DIR` | `/etc/ssl/cubrid-webmanager` | TLS directory on the server. |
| `CWM_SEED` / `CWM_SALT` | — | Written as `SEED` / `SALT` in the env file. |
| `CWM_ALLOWED_ORIGINS` | — | Written as `ALLOWED_ORIGINS`. |
| `CWM_API_PORT` | `8080` | Written as `PORT`. |
| `CWM_NGINX_SSL_PORT` | `443` | Public HTTPS port (nginx). |
| `CWM_PUBLIC_HOST` / `CWM_PUBLIC_IP` | `localhost` | Hostname/IP for certs and URLs. |
| `CWM_NODE_MAJOR` | `20` | Node.js major version for install scripts. |
| `CWM_ARTIFACT_ZIP` | — | Deployment zip path (`deploy-cubrid-webmanager.sh`). |
| `CWM_SERVICE_USER` / `CWM_SERVICE_GROUP` | `cubrid` | systemd service user/group. |

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
