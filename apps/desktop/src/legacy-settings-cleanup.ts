import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { getExecutableDir, getPortableAppRoot, isPortableRuntime } from './portable-root';

const SETTINGS_FILE = 'desktop-settings.json';

function unlinkIfExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  console.log('[desktop] removed legacy settings:', filePath);
  return true;
}

/**
 * Settings used to live under OS userData (Library / AppData). Remove those copies.
 */
export function removeLegacyUserDataSettings(): void {
  const candidates = new Set<string>([path.join(app.getPath('userData'), SETTINGS_FILE)]);

  const appSupport = path.join(
    process.env.HOME || app.getPath('home'),
    'Library',
    'Application Support'
  );
  if (process.platform === 'darwin' && fs.existsSync(appSupport)) {
    for (const name of fs.readdirSync(appSupport)) {
      if (name.toLowerCase().includes('cubrid') && name.toLowerCase().includes('web')) {
        candidates.add(path.join(appSupport, name, SETTINGS_FILE));
      }
      if (name.startsWith('@cubrid')) {
        candidates.add(path.join(appSupport, name, 'desktop', SETTINGS_FILE));
      }
    }
  }

  for (const filePath of candidates) {
    try {
      unlinkIfExists(filePath);
    } catch (error) {
      console.warn('[desktop] failed to remove legacy settings:', filePath, error);
    }
  }
}

/** Remove settings stored in the wrong folder (e.g. dist/portable/, inside the bundle). */
export function removeMisplacedPortableSettings(): void {
  if (!isPortableRuntime()) {
    return;
  }

  const installDir = getPortableAppRoot();
  const correctSettings = path.join(installDir, SETTINGS_FILE);
  const legacyLocations = [
    path.join(getExecutableDir(), SETTINGS_FILE),
    path.join(path.dirname(installDir), SETTINGS_FILE),
  ];

  for (const filePath of legacyLocations) {
    if (filePath === correctSettings) {
      continue;
    }

    try {
      unlinkIfExists(filePath);
    } catch (error) {
      console.warn('[desktop] failed to remove misplaced settings:', filePath, error);
    }
  }
}

export function cleanupLegacyDesktopSettings(): void {
  removeLegacyUserDataSettings();
  removeMisplacedPortableSettings();
}
