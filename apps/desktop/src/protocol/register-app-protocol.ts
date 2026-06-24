import { net, protocol } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { proxyApiRequest, toApiUpstreamPath } from './proxy-api-request';

let rendererRootResolved: string | null = null;
let apiSocketPath: string | undefined;
let protocolRegistered = false;

export function registerPrivilegedAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
}

export function setAppProtocolApiSocket(socketPath: string | undefined): void {
  apiSocketPath = socketPath;
}

export function registerAppProtocol(rendererRoot: string): void {
  if (protocolRegistered) {
    return;
  }

  if (!fs.existsSync(rendererRoot)) {
    throw new Error(`Renderer dist not found: ${rendererRoot}. Run nx build web-manager first.`);
  }

  rendererRootResolved = path.resolve(rendererRoot);

  protocol.handle('app', async (request) => {
    if (!rendererRootResolved) {
      return new Response('App protocol not initialized', { status: 500 });
    }

    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const upstreamPath = toApiUpstreamPath(pathname);
    if (upstreamPath) {
      if (!apiSocketPath) {
        return new Response('API server is not running', { status: 503 });
      }
      return proxyApiRequest(request, apiSocketPath, upstreamPath);
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let filePath = path.resolve(rendererRootResolved, relativePath);

    if (!filePath.startsWith(rendererRootResolved)) {
      return new Response('Forbidden', { status: 403 });
    }

    const hasFileExtension = path.extname(relativePath) !== '';
    if (!fs.existsSync(filePath) && !hasFileExtension) {
      filePath = path.join(rendererRootResolved, 'index.html');
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  protocolRegistered = true;
}
