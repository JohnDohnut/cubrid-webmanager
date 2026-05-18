import * as path from 'path';
import { app } from 'electron';

function isPackagedRuntime(): boolean {
  if (app.isPackaged) {
    return true;
  }

  // electron-builder dir output: .../MyApp.app/Contents/MacOS/MyApp
  return process.platform === 'darwin' && process.execPath.includes('.app/Contents/MacOS/');
}

/** Directory that contains the running binary (MacOS/, win-unpacked/, etc.). */
export function getExecutableDir(): string {
  if (!isPackagedRuntime()) {
    return getRepoRoot();
  }

  return path.dirname(process.execPath);
}

/**
 * Install root beside the app: folder that contains the .app (mac) or the exe (win/linux).
 * `desktop-settings.json` and default `cwm-workspace/` live here — never inside the bundle.
 */
export function getPortableAppRoot(): string {
  if (!isPackagedRuntime()) {
    return getRepoRoot();
  }

  const execDir = getExecutableDir();
  if (process.platform === 'darwin') {
    return path.dirname(getAppBundlePath()!);
  }

  return execDir;
}

/** macOS `.app` bundle path when running a packaged build; otherwise `null`. */
export function getAppBundlePath(): string | null {
  if (!isPackagedRuntime() || process.platform !== 'darwin') {
    return null;
  }

  return path.resolve(getExecutableDir(), '..', '..');
}

export function isPathInsideAppBundle(resolvedPath: string): boolean {
  const bundlePath = getAppBundlePath();
  if (!bundlePath) {
    return false;
  }

  return (
    resolvedPath === bundlePath || resolvedPath.startsWith(`${bundlePath}${path.sep}`)
  );
}

export function getRepoRoot(): string {
  return path.resolve(__dirname, '..', '..', '..', '..');
}

export function isPortableRuntime(): boolean {
  return isPackagedRuntime();
}
