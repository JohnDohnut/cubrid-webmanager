import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { config as loadEnv } from 'dotenv';
import { parseCliArgs } from './parse-cli-args';

const CWM_CONF_FILENAME = 'cwm.conf';

type CwmConf = Record<string, string>;

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

function loadCwmConf(baseDir: string): void {
  const confPath = path.join(baseDir, CWM_CONF_FILENAME);
  const conf = readCwmConf(confPath);
  let dirty = false;

  if (!conf.SEED) {
    conf.SEED = crypto.randomBytes(32).toString('hex');
    dirty = true;
    console.log('[cwm.conf] SEED auto-generated');
  }
  if (!conf.SALT) {
    conf.SALT = crypto.randomBytes(32).toString('hex');
    dirty = true;
    console.log('[cwm.conf] SALT auto-generated');
  }

  if (dirty) {
    try {
      writeCwmConf(confPath, conf);
      console.log(`[cwm.conf] saved: ${confPath}`);
    } catch (err) {
      console.warn(`[cwm.conf] could not write ${confPath}:`, (err as Error).message);
    }
  }

  injectIntoEnv(conf);
  console.log(`[cwm.conf] loaded: ${confPath}`);
}

/**
 * Loads env before Nest bootstrap (pkg-aware base dir).
 *
 * Priority (highest to lowest):
 *   1. process.env already set (systemd EnvironmentFile etc.)
 *   2. cwm.conf (JSON, next to executable / project root)
 *   3. .env file (dotenv, for local dev / legacy)
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

  const confPath = path.join(baseDir, CWM_CONF_FILENAME);
  if (isPkg || fs.existsSync(confPath)) {
    loadCwmConf(baseDir);
  }

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
