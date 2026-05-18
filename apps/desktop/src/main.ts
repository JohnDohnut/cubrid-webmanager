import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ApiProcessHandle, startApiServer, stopApiServer } from './api-process';
import { getApiSocketPath, getRendererDistDir } from './paths';
import { registerAppProtocol, registerPrivilegedAppScheme } from './register-app-protocol';
import { waitForApiReady } from './wait-for-api';

registerPrivilegedAppScheme();

let apiProcess: ApiProcessHandle | null = null;

function clearRendererAuthToken(window: BrowserWindow): void {
  if (window.isDestroyed()) {
    return;
  }

  void window.webContents
    .executeJavaScript('localStorage.removeItem("token")', true)
    .catch(() => undefined);
}

async function createMainWindow(apiBaseUrl: string): Promise<BrowserWindow> {
  const rendererRoot = getRendererDistDir();
  const preloadPath = path.join(__dirname, 'preload.js');

  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      additionalArguments: [`--cwm-api-base-url=${apiBaseUrl}`],
    },
  });

  window.on('close', () => {
    clearRendererAuthToken(window);
  });

  await window.loadURL('app://./index.html');
  window.once('ready-to-show', () => window.show());
  return window;
}

async function bootstrap(): Promise<void> {
  const socketPath = getApiSocketPath();
  registerAppProtocol(getRendererDistDir(), socketPath);

  apiProcess = await startApiServer(socketPath);
  await waitForApiReady(socketPath);
  await createMainWindow(apiProcess.apiBaseUrl);
}

app.whenReady().then(bootstrap).catch((error) => {
  console.error('[desktop] failed to start', error);
  app.exit(1);
});

app.on('window-all-closed', () => {
  stopApiServer(apiProcess?.child ?? null);
  apiProcess = null;
  app.quit();
});

app.on('before-quit', () => {
  stopApiServer(apiProcess?.child ?? null);
  apiProcess = null;
});
