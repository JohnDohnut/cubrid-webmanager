import * as path from 'path';
import { getPortableAppRoot } from './portable-root';

/** SEED/SALT storage — sibling of `cwm-workspace/`, not inside it. */
export const VAULT_DIR_NAME = 'cwm-vault';

export function getVaultDir(): string {
  return path.join(getPortableAppRoot(), VAULT_DIR_NAME);
}

export function getSecretsFilePath(): string {
  return path.join(getVaultDir(), 'secrets.json');
}
