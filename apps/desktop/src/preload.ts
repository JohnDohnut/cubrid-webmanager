import { contextBridge } from 'electron';
import type { DesktopConfig } from './desktop-api';

function resolveApiBaseUrl(): string {
  const prefix = '--cwm-api-base-url=';
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : '';
}

contextBridge.exposeInMainWorld('desktopConfig', {
  apiBaseUrl: resolveApiBaseUrl(),
  clearAuthOnExit: true,
} satisfies DesktopConfig);
