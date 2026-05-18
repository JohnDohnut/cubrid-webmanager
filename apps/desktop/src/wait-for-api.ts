import * as net from 'net';

const DEFAULT_TIMEOUT_MS = 30_000;
const RETRY_INTERVAL_MS = 250;

export async function waitForApiReady(
  socketPath: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const connected = await tryConnect(socketPath);
    if (connected) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  throw new Error(`API server did not become ready on ${socketPath}`);
}

function tryConnect(socketPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ path: socketPath }, () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}
