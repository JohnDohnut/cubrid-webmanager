import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import { DESKTOP_API_BASE_URL } from '../config/constants';
import { resolveDesktopAllowedOrigin } from '../protocol/origin';
import { getApiServerDir, getApiServerEntry, getWorkspacePaths } from '../workspace/paths';
import { loadOrCreateDesktopSecrets } from '../config/secrets';

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
  const paths = getWorkspacePaths();

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
      STORAGE_PATH: paths.storageDir,
      CWM_SSL_DIR: paths.sslDir,
      ALLOWED_ORIGINS: allowedOrigin,
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  child.on('error', (error) => {
    console.error('[desktop] API process failed to start', error);
  });

  return { child, socketPath, apiBaseUrl: DESKTOP_API_BASE_URL };
}

export function stopApiServer(child: ChildProcess | null, options?: { force?: boolean }): void {
  if (!child || child.killed || child.pid == null) {
    return;
  }

  const force = options?.force ?? false;
  const pid = child.pid;

  try {
    child.kill(force ? 'SIGKILL' : 'SIGTERM');
  } catch {
    // process may already be gone
  }

  if (force) {
    return;
  }

  try {
    process.kill(pid, 0);
    process.kill(pid, 'SIGKILL');
  } catch {
    // already exited
  }
}
