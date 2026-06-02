#!/usr/bin/env node
/**
 * Copy web-manager build output into api-server's public directory.
 * Run after both builds complete:
 *   npm run build:web-manager && npm run build:api-server && node scripts/copy-web-to-api.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SRC = path.join(ROOT, 'dist', 'apps', 'web-manager');
const DEST = path.join(ROOT, 'dist', 'apps', 'api-server', 'public');

if (!fs.existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  console.error('Run `npm run build:web-manager` first.');
  process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(SRC, DEST, { recursive: true });

console.log(`Copied ${SRC} → ${DEST}`);
