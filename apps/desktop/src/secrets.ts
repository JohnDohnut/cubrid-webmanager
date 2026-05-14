import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { getDataDir } from './paths';

type DesktopSecrets = {
  seed: string;
  salt: string;
};

const SECRETS_FILE = 'desktop-secrets.json';

function secretsPath(): string {
  return path.join(getDataDir(), SECRETS_FILE);
}

function readSecretsFile(): DesktopSecrets | null {
  const filePath = secretsPath();
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as DesktopSecrets;
  if (!parsed.seed || !parsed.salt) {
    throw new Error(`Invalid desktop secrets file: ${filePath}`);
  }

  return parsed;
}

function writeSecretsFile(secrets: DesktopSecrets): void {
  const filePath = secretsPath();
  fs.writeFileSync(filePath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
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
