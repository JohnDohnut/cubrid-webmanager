import * as path from 'path';
import { app } from 'electron';
import { getRepoRoot } from './portable-root';
import {
  ensureWorkspaceDirectories,
  removeStaleUnixSocket,
  resolveWorkspacePaths,
  type WorkspacePaths,
} from './workspace-paths';

export { getRepoRoot };

let cachedPaths: WorkspacePaths | null = null;

export function getWorkspacePaths(): WorkspacePaths {
  if (!cachedPaths) {
    cachedPaths = resolveWorkspacePaths();
    ensureWorkspaceDirectories(cachedPaths);
  }

  return cachedPaths;
}

export function refreshWorkspacePaths(): WorkspacePaths {
  cachedPaths = resolveWorkspacePaths();
  ensureWorkspaceDirectories(cachedPaths);
  return cachedPaths;
}

export function getDataDir(): string {
  return getWorkspacePaths().dataDir;
}

export function getStorageDir(): string {
  return getWorkspacePaths().storageDir;
}

export function getSslDir(): string {
  return getWorkspacePaths().sslDir;
}

export function getApiSocketPath(): string {
  const paths = getWorkspacePaths();
  removeStaleUnixSocket(paths.socketPath);
  return paths.socketPath;
}

export function getRendererDistDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'web-manager');
  }

  return path.join(getRepoRoot(), 'dist/apps/web-manager');
}

export function getApiServerDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'api-server');
  }

  return path.join(getRepoRoot(), 'dist/apps/api-server');
}

export function getApiServerEntry(): string {
  return path.join(getApiServerDir(), 'main.js');
}
