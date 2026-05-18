import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export function getWorkspaceRoot(): string {
  return path.resolve(__dirname, '..', '..', '..');
}

export function getPortableRoot(): string {
  if (app.isPackaged) {
    return path.dirname(process.execPath);
  }

  return getWorkspaceRoot();
}

export function getDataDir(): string {
  const dataDir = path.join(getPortableRoot(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

export function getStorageDir(): string {
  const storageDir = path.join(getDataDir(), 'storage');
  fs.mkdirSync(storageDir, { recursive: true });
  return storageDir;
}

export function getRendererDistDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'web-manager');
  }

  return path.join(getWorkspaceRoot(), 'dist/apps/web-manager');
}

export function getApiServerDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'api-server');
  }

  return path.join(getWorkspaceRoot(), 'dist/apps/api-server');
}

export function getApiServerEntry(): string {
  return path.join(getApiServerDir(), 'main.js');
}

export function getApiSocketPath(): string {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\cwm-webmanager-${process.pid}`;
  }

  return path.join(getDataDir(), 'api.sock');
}
