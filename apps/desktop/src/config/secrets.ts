import * as crypto from 'crypto';
import * as fs from 'fs';
import { getSecretsFilePath, getVaultDir } from './vault-paths';

type DesktopSecrets = {
  seed: string;
  salt: string;
};

function readSecretsFile(): DesktopSecrets | null {
  const filePath = getSecretsFilePath();
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as DesktopSecrets;
  if (!parsed.seed || !parsed.salt) {
    throw new Error(`Invalid secrets file: ${filePath}`);
  }

  return parsed;
}

function writeSecretsFile(secrets: DesktopSecrets): void {
  fs.mkdirSync(getVaultDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(getSecretsFilePath(), JSON.stringify(secrets, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
}

export function loadOrCreateDesktopSecrets(): DesktopSecrets {
  const existing = readSecretsFile();
  if (existing) {
    return existing;
  }

  const created: DesktopSecrets = {
    seed: crypto.randomBytes(32).toString('hex'),
    salt: crypto.randomBytes(16).toString('hex'),
  };
  writeSecretsFile(created);
  return created;
}
