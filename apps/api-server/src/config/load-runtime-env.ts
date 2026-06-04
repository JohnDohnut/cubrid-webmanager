import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { config as loadEnv } from 'dotenv';
import { parseCliArgs } from './parse-cli-args';

const CWM_CONF_FILENAME = 'cwm.conf';
const CWM_CONF_SUBDIR = 'conf';

// cwm-vault: auto-managed secrets (SEED/SALT) — never edited by the user.
// Mirrors the structure used by the Electron desktop app.
const CWM_VAULT_DIRNAME = 'cwm-vault';
const CWM_VAULT_SECRETS_FILENAME = 'secrets.json';

type CwmConf = Record<string, string>;
type CwmSecrets = { seed: string; salt: string };

// ── conf/cwm.conf ────────────────────────────────────────────────────────────

function readCwmConf(confPath: string): CwmConf {
  try {
    return JSON.parse(fs.readFileSync(confPath, 'utf8')) as CwmConf;
  } catch {
    return {};
  }
}

function writeCwmConf(confPath: string, conf: CwmConf): void {
  fs.writeFileSync(confPath, JSON.stringify(conf, null, 2), 'utf8');
}

function injectIntoEnv(conf: CwmConf): void {
  for (const [key, value] of Object.entries(conf)) {
    if (process.env[key] === undefined && typeof value === 'string') {
      process.env[key] = value;
    }
  }
}

function loadCwmConf(confDir: string): void {
  const confPath = path.join(confDir, CWM_CONF_FILENAME);
  const conf = readCwmConf(confPath);

  // SEED/SALT must not live in cwm.conf — they belong in cwm-vault/secrets.json.
  // Strip them if someone copied them here from an older version.
  delete conf.SEED;
  delete conf.SALT;

  injectIntoEnv(conf);
  if (fs.existsSync(confPath)) {
    console.log(`[cwm.conf] loaded: ${confPath}`);
  }
}

// ── cwm-vault/secrets.json ───────────────────────────────────────────────────

function getVaultDir(baseDir: string): string {
  return path.join(baseDir, CWM_VAULT_DIRNAME);
}

function readSecrets(secretsPath: string): CwmSecrets | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(secretsPath, 'utf8')) as CwmSecrets;
    if (parsed.seed && parsed.salt) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeSecrets(vaultDir: string, secrets: CwmSecrets): void {
  fs.mkdirSync(vaultDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(
    path.join(vaultDir, CWM_VAULT_SECRETS_FILENAME),
    JSON.stringify(secrets, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
}

/**
 * Load SEED/SALT from cwm-vault/secrets.json.
 * Auto-generates and saves them on first run. Never overwrites existing values.
 */
function loadOrCreateVaultSecrets(baseDir: string): void {
  const vaultDir = getVaultDir(baseDir);
  const secretsPath = path.join(vaultDir, CWM_VAULT_SECRETS_FILENAME);

  let secrets = readSecrets(secretsPath);

  if (!secrets) {
    secrets = {
      seed: crypto.randomBytes(32).toString('hex'),
      salt: crypto.randomBytes(32).toString('hex'),
    };
    try {
      writeSecrets(vaultDir, secrets);
      console.log(`[cwm-vault] secrets generated: ${secretsPath}`);
    } catch (err) {
      console.warn(`[cwm-vault] could not write secrets:`, (err as Error).message);
    }
  }

  if (process.env.SEED === undefined) process.env.SEED = secrets.seed;
  if (process.env.SALT === undefined) process.env.SALT = secrets.salt;
}

// ── conf/ resolution ─────────────────────────────────────────────────────────

function resolveCwmConfDir(baseDir: string): string | null {
  const subDir = path.join(baseDir, CWM_CONF_SUBDIR);
  if (fs.existsSync(path.join(subDir, CWM_CONF_FILENAME))) {
    return subDir;
  }
  if (fs.existsSync(path.join(baseDir, CWM_CONF_FILENAME))) {
    return baseDir;
  }
  // pkg 첫 실행: conf/ 폴더에 생성
  return path.join(baseDir, CWM_CONF_SUBDIR);
}

// ── entry point ──────────────────────────────────────────────────────────────

/**
 * Loads env before Nest bootstrap (pkg-aware base dir).
 *
 * Priority (highest to lowest):
 *   1. process.env already set (systemd EnvironmentFile etc.)
 *   2. cwm-vault/secrets.json  — SEED/SALT (auto-generated, do not edit)
 *   3. conf/cwm.conf           — user config (PORT, ENVIRONMENT, etc.)
 *   4. .env file               — local dev / legacy
 */
export function loadRuntimeEnv(): void {
  if ((process.env.CWM_DESKTOP ?? '').trim() === '1') {
    return;
  }

  const args = parseCliArgs(process.argv.slice(2));
  const rawMode = (
    args.ENV ??
    args.ENVIRONMENT ??
    process.env.ENVIRONMENT ??
    'development'
  ).toLowerCase();
  const isProduction = rawMode === 'production';
  const isPkg = !!(process as any).pkg;
  const baseDir = isPkg ? path.dirname(process.execPath) : process.cwd();

  // 1. SEED/SALT from cwm-vault (pkg mode or when vault already exists)
  const vaultExists = fs.existsSync(path.join(getVaultDir(baseDir), CWM_VAULT_SECRETS_FILENAME));
  if (isPkg || vaultExists) {
    loadOrCreateVaultSecrets(baseDir);
  }

  // 2. User config from conf/cwm.conf
  const confDir = resolveCwmConfDir(baseDir);
  const confPath = confDir ? path.join(confDir, CWM_CONF_FILENAME) : null;
  if (confPath && (isPkg || fs.existsSync(confPath))) {
    loadCwmConf(confDir ?? baseDir);
  }

  // 3. .env fallback (local dev / legacy)
  const candidates: string[] = [];
  if (isProduction) {
    candidates.push('/etc/cubrid-webmanager.env');
    candidates.push(path.join(baseDir, 'apps/api-server/.env'));
    candidates.push(path.join(baseDir, '.env'));
  } else {
    candidates.push(path.join(baseDir, '.env'));
    candidates.push(path.join(baseDir, 'apps/api-server/.env'));
  }

  const envFilePath = candidates.find((p) => fs.existsSync(p)) ?? null;
  if (envFilePath) {
    loadEnv({ path: envFilePath, override: false });
  }
}
