import { contextBridge } from 'electron';
import type { DesktopConfig } from './desktop-api';
import { DESKTOP_API_BASE_URL } from './desktop-constants';

function resolveApiBaseUrl(): string {
  const prefix = '--cwm-api-base-url=';
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : DESKTOP_API_BASE_URL;
}

contextBridge.exposeInMainWorld('desktopConfig', {
  apiBaseUrl: resolveApiBaseUrl(),
  clearAuthOnExit: true,
} satisfies DesktopConfig);
