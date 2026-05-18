import { BrowserWindow } from 'electron';
import * as path from 'path';

/** Hash routes keep asset URLs rooted at index.html (./assets/...). */
export function toAppRouteUrl(routePath: string): string {
  const normalized = routePath.replace(/^\/+/, '');
  return `app://./index.html#/${normalized}`;
}

export function createAppWindow(apiBaseUrl?: string): BrowserWindow {
  const preloadPath = path.join(__dirname, 'preload.js');
  const additionalArguments = apiBaseUrl ? [`--cwm-api-base-url=${apiBaseUrl}`] : [];

  return new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      additionalArguments,
    },
  });
}
