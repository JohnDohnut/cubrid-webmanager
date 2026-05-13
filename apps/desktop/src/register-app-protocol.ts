import { net, protocol } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

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

export function registerAppProtocol(rendererRoot: string): void {
  if (!fs.existsSync(rendererRoot)) {
    throw new Error(`Renderer dist not found: ${rendererRoot}. Run nx build web-manager first.`);
  }

  const rendererRootResolved = path.resolve(rendererRoot);

  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.resolve(rendererRootResolved, relativePath.replace(/^\//, ''));

    if (!filePath.startsWith(rendererRootResolved)) {
      return new Response('Forbidden', { status: 403 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}
