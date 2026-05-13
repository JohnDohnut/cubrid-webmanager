import { app, BrowserWindow, session } from 'electron';
import * as path from 'path';
import { ApiProcessHandle, startApiServer, stopApiServer } from './api-process';
import { reserveFreePort } from './free-port';
import { getRendererDistDir } from './paths';
import { registerAppProtocol, registerPrivilegedAppScheme } from './register-app-protocol';
import { waitForApiReady } from './wait-for-api';

registerPrivilegedAppScheme();

let apiProcess: ApiProcessHandle | null = null;

function configureLoopbackTls(): void {
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    if (request.hostname === '127.0.0.1' || request.hostname === 'localhost') {
      callback(0);
      return;
    }

    callback(-3);
  });
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

  await window.loadURL('app://./index.html');
  window.once('ready-to-show', () => window.show());
  return window;
}

async function bootstrap(): Promise<void> {
  configureLoopbackTls();
  registerAppProtocol(getRendererDistDir());

  const port = await reserveFreePort('127.0.0.1');
  apiProcess = await startApiServer(port);
  await waitForApiReady('127.0.0.1', port);
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
