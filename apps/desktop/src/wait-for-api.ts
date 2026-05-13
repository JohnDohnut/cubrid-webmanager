import * as net from 'net';

const DEFAULT_TIMEOUT_MS = 30_000;
const RETRY_INTERVAL_MS = 250;

export async function waitForApiReady(
  host: string,
  port: number,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const connected = await tryConnect(host, port);
    if (connected) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  throw new Error(`API server did not become ready on ${host}:${port}`);
}

function tryConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}
