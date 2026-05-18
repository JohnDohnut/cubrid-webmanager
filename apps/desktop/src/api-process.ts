import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import { resolveDesktopAllowedOrigin } from './desktop-origin';
import { DESKTOP_API_BASE_URL } from './desktop-constants';
import { getApiServerEntry, getApiServerDir, getStorageDir } from './paths';
import { loadOrCreateDesktopSecrets } from './secrets';

export type ApiProcessHandle = {
  child: ChildProcess;
  socketPath: string;
  apiBaseUrl: string;
};

function getNodeExecutable(): string {
  return process.execPath;
}

export async function startApiServer(socketPath: string): Promise<ApiProcessHandle> {
  const entry = getApiServerEntry();
  if (!fs.existsSync(entry)) {
    throw new Error(`API server entry not found: ${entry}. Run nx build api-server first.`);
  }

  const secrets = loadOrCreateDesktopSecrets();
  const allowedOrigin = resolveDesktopAllowedOrigin();
  const storagePath = getStorageDir();

  const child = spawn(getNodeExecutable(), [entry], {
    cwd: getApiServerDir(),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      CWM_DESKTOP: '1',
      ENVIRONMENT: 'development',
      LISTEN_UNIX_SOCKET: socketPath,
      SEED: secrets.seed,
      SALT: secrets.salt,
      STORAGE_PATH: storagePath,
      ALLOWED_ORIGINS: allowedOrigin,
    },
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error('[desktop] API process failed to start', error);
  });

  return { child, socketPath, apiBaseUrl: DESKTOP_API_BASE_URL };
}

export function stopApiServer(child: ChildProcess | null): void {
  if (!child || child.killed) {
    return;
  }

  child.kill('SIGTERM');
}
