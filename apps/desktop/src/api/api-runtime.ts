import { getApiSocketPath, refreshWorkspacePaths } from '../workspace/paths';
import { setAppProtocolApiSocket } from '../protocol/register-app-protocol';
import { ApiProcessHandle, startApiServer, stopApiServer } from './api-process';
import { waitForApiReady } from './wait-for-api';

let apiProcess: ApiProcessHandle | null = null;

export function getApiProcess(): ApiProcessHandle | null {
  return apiProcess;
}

export async function startApiForCurrentWorkspace(): Promise<ApiProcessHandle> {
  const socketPath = getApiSocketPath();
  setAppProtocolApiSocket(socketPath);

  const handle = await startApiServer(socketPath);
  await waitForApiReady(socketPath);
  apiProcess = handle;
  return handle;
}

export async function restartApiForCurrentWorkspace(): Promise<void> {
  stopDesktopApi();
  refreshWorkspacePaths();
  await startApiForCurrentWorkspace();
}

export function stopDesktopApi(): void {
  const child = apiProcess?.child ?? null;
  stopApiServer(child, { force: true });
  apiProcess = null;
  setAppProtocolApiSocket(undefined);
}
